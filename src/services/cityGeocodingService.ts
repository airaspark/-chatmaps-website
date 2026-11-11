import { loadGoogleMapsLibraries } from './googleMapsLoader';
import { GpsCoordinates } from './locationService';

export interface CityAddress {
  city: string;
  state: string | null;
  locality: string | null;
}

const ERROR_CACHE_TTL_MS = 60 * 1000;
const REQUEST_DEBOUNCE_MS = 350;
const errorCache = new Map<string, { expiresAt: number; error: Error }>();
const inFlightRequests = new Map<string, Promise<CityAddress>>();
let lastRequestStartedAt = 0;
let authorizationFailure: { expiresAt: number; error: Error } | null = null;
let geocodeQueue: Promise<void> = Promise.resolve();

const coordinateKey = ({ lat, lng }: GpsCoordinates): string => `${lat.toFixed(3)},${lng.toFixed(3)}`;

const waitForGeocoderSlot = async (): Promise<void> => {
  const previousRequest = geocodeQueue;
  let releaseRequest!: () => void;
  geocodeQueue = new Promise(resolve => { releaseRequest = resolve; });
  await previousRequest;
  const waitMs = Math.max(0, REQUEST_DEBOUNCE_MS - (Date.now() - lastRequestStartedAt));
  if (waitMs > 0) await new Promise(resolve => window.setTimeout(resolve, waitMs));
  lastRequestStartedAt = Date.now();
  releaseRequest();
};

const componentValue = (
  components: Array<{ long_name: string; types: string[] }>,
  types: string[]
): string | null => {
  for (const type of types) {
    const component = components.find(item => item.types.includes(type));
    if (component?.long_name) return component.long_name;
  }
  return null;
};

const performReverseGeocode = async (coordinates: GpsCoordinates): Promise<CityAddress> => {
  await loadGoogleMapsLibraries();
  const maps = (window as Window & { google?: any }).google?.maps;
  if (!maps?.Geocoder) throw new Error('Google Maps geocoding is unavailable. You can select your city manually.');

  await waitForGeocoderSlot();
  let response: any;
  try {
    response = await new maps.Geocoder().geocode({
      location: { lat: coordinates.lat, lng: coordinates.lng }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    if (/REQUEST_DENIED|not allowed|denied/i.test(detail)) {
      throw new Error('Google denied reverse geocoding for this website. Check that Geocoding API is enabled and allowed for the existing browser API key. Your GPS coordinates are still available; select a city manually.');
    }
    throw new Error(`Could not identify a city from GPS${detail ? `: ${detail}` : ''}. Your GPS coordinates are still available; select a city manually.`);
  }

  const status = response?.status || 'OK';
  if (status !== 'OK' && status !== 'ZERO_RESULTS') {
    const descriptions: Record<string, string> = {
      REQUEST_DENIED: 'Google denied reverse geocoding for this website. Check that Geocoding API is enabled and allowed for the existing browser API key.',
      OVER_QUERY_LIMIT: 'Google geocoding quota was reached. Try again later.',
      UNKNOWN_ERROR: 'Google geocoding had a temporary error. Try again later.'
    };
    throw new Error(`${descriptions[status] || `Google geocoding failed (${status}).`} Your GPS coordinates are still available; select a city manually.`);
  }

  const result = response.results?.find((item: any) => item.types?.some((type: string) =>
    ['locality', 'postal_town', 'administrative_area_level_2'].includes(type)
  )) || response.results?.[0];
  if (!result) throw new Error('A city could not be identified from this GPS fix. Your coordinates are available; select a city manually.');

  const components = result.address_components || [];
  const city = componentValue(components, ['locality', 'postal_town', 'administrative_area_level_2']);
  if (!city) throw new Error('A city could not be identified from this GPS fix. Your coordinates are available; select a city manually.');

  return {
    city,
    state: componentValue(components, ['administrative_area_level_1']),
    locality: componentValue(components, ['sublocality_level_1', 'sublocality', 'neighborhood'])
  };
};

/** Reverse-geocode only explicit browser GPS coordinates; successful results remain memory-only. */
export const reverseGeocodeCity = async (coordinates: GpsCoordinates): Promise<CityAddress> => {
  const key = coordinateKey(coordinates);
  if (authorizationFailure && authorizationFailure.expiresAt > Date.now()) throw authorizationFailure.error;
  if (authorizationFailure) authorizationFailure = null;
  const cachedError = errorCache.get(key);
  if (cachedError && cachedError.expiresAt > Date.now()) throw cachedError.error;
  if (cachedError) errorCache.delete(key);

  const current = inFlightRequests.get(key);
  if (current) return current;

  const request = performReverseGeocode(coordinates)
    .then(value => value)
    .catch(error => {
      const normalized = error instanceof Error ? error : new Error('Reverse geocoding failed. Select your city manually.');
      errorCache.set(key, { expiresAt: Date.now() + ERROR_CACHE_TTL_MS, error: normalized });
      if (/denied/i.test(normalized.message)) authorizationFailure = { expiresAt: Date.now() + ERROR_CACHE_TTL_MS, error: normalized };
      throw normalized;
    })
    .finally(() => inFlightRequests.delete(key));

  inFlightRequests.set(key, request);
  return request;
};
