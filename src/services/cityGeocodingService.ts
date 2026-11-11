import { loadGoogleMapsLibraries } from './googleMapsLoader';
import { GpsCoordinates } from './locationService';

export interface CityAddress {
  city: string;
  state: string | null;
  locality: string | null;
}

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

/** Reverse-geocode one explicit device fix through the app's shared Maps loader. */
export const reverseGeocodeCity = async (coordinates: GpsCoordinates): Promise<CityAddress> => {
  await loadGoogleMapsLibraries();
  const maps = (window as Window & { google?: any }).google?.maps;
  if (!maps?.Geocoder) throw new Error('Google Maps geocoding is unavailable. Select your city manually.');

  const response = await new maps.Geocoder().geocode({
    location: { lat: coordinates.lat, lng: coordinates.lng }
  });
  const result = response.results?.find((item: any) => item.types?.some((type: string) =>
    ['locality', 'postal_town', 'administrative_area_level_2'].includes(type)
  )) || response.results?.[0];
  if (!result) throw new Error('A city could not be identified from this GPS fix. Select your city manually.');

  const components = result.address_components || [];
  const city = componentValue(components, ['locality', 'postal_town', 'administrative_area_level_2']);
  if (!city) throw new Error('A city could not be identified from this GPS fix. Select your city manually.');

  return {
    city,
    state: componentValue(components, ['administrative_area_level_1']),
    locality: componentValue(components, ['sublocality_level_1', 'sublocality', 'neighborhood'])
  };
};
