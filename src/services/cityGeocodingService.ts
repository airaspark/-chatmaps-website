import { loadGoogleMapsLibraries } from './googleMapsLoader';
import { GpsCoordinates } from './locationService';

export interface CityAddress {
  city: string;
  state: string | null;
  locality: string | null;
}

const ERROR_CACHE_TTL_MS = 60 * 1000;
const SUCCESS_CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_DEBOUNCE_MS = 350;
const errorCache = new Map<string, { expiresAt: number; error: Error }>();
const successCache = new Map<string, { expiresAt: number; value: CityAddress }>();
const inFlightRequests = new Map<string, Promise<CityAddress>>();
let lastRequestStartedAt = 0;
let authorizationFailure: { expiresAt: number; error: Error } | null = null;
let geocodeQueue: Promise<void> = Promise.resolve();

const coordinateKey = ({ lat, lng }: GpsCoordinates): string => `${lat.toFixed(5)},${lng.toFixed(5)}`;

export const geocoderStatusMessage = (status: string): string => {
  const descriptions: Record<string, string> = {
    REQUEST_DENIED: 'Google denied reverse geocoding for this website. Enable Geocoding API for the existing browser key and allow this site’s referrer in its API restrictions. Your GPS coordinates are still available; select your city manually.',
    ZERO_RESULTS: 'Google returned no address for these coordinates. Your GPS coordinates are still available; select your city manually.',
    OVER_QUERY_LIMIT: 'Google geocoding quota was reached. Your GPS coordinates are still available; try again later.',
    UNKNOWN_ERROR: 'Google geocoding had a temporary server error. Your GPS coordinates are still available; try again later.',
    ERROR: 'The geocoding request failed due to a network or server error. Your GPS coordinates are still available; check your connection and try again.',
    INVALID_REQUEST: 'Google could not geocode this coordinate request. Your GPS coordinates are still available; select your city manually.'
  };
  return descriptions[status] || `Google geocoding failed (${status}). Your GPS coordinates are still available; select your city manually.`;
};

const networkFailureMessage = (): string =>
  'Reverse geocoding could not reach Google because of a network error. Your GPS coordinates are still available; check your connection or select your city manually.';

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
    const detail = `${(error as any)?.code || ''} ${error instanceof Error ? error.message : String(error)}`;
    const denied = detail.match(/REQUEST_DENIED/i);
    if (denied || /not allowed|access denied/i.test(detail)) throw new Error(geocoderStatusMessage('REQUEST_DENIED'));
    const status = detail.match(/ZERO_RESULTS|OVER_QUERY_LIMIT|UNKNOWN_ERROR|INVALID_REQUEST/i)?.[0];
    if (status) throw new Error(geocoderStatusMessage(status));
    if (typeof navigator !== 'undefined' && !navigator.onLine || /network|fetch|offline|connection/i.test(detail)) {
      throw new Error(networkFailureMessage());
    }
    throw new Error(`Reverse geocoding request failed. ${detail ? `${detail}. ` : ''}Your GPS coordinates are still available; select your city manually.`);
  }

  const status = response?.status || 'OK';
  if (status === 'ZERO_RESULTS') throw new Error(geocoderStatusMessage(status));
  if (status !== 'OK') throw new Error(geocoderStatusMessage(status));

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
  const cachedSuccess = successCache.get(key);
  if (cachedSuccess && cachedSuccess.expiresAt > Date.now()) return cachedSuccess.value;
  if (cachedSuccess) successCache.delete(key);
  if (authorizationFailure && authorizationFailure.expiresAt > Date.now()) throw authorizationFailure.error;
  if (authorizationFailure) authorizationFailure = null;
  const cachedError = errorCache.get(key);
  if (cachedError && cachedError.expiresAt > Date.now()) throw cachedError.error;
  if (cachedError) errorCache.delete(key);

  const current = inFlightRequests.get(key);
  if (current) return current;

  const request = performReverseGeocode(coordinates)
    .then(value => {
      successCache.set(key, { expiresAt: Date.now() + SUCCESS_CACHE_TTL_MS, value });
      return value;
    })
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
