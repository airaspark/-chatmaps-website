import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const CHATMAPS_DEFAULT_MAP_ID = 'a54c70146c10e24ca6df8436';

let librariesPromise: Promise<{ Map: any; AdvancedMarkerElement: any; RenderingType: any }> | null = null;
let configuredApiKey: string | null = null;

export const getGoogleMapsApiKey = (): string =>
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || (window as any).__GOOGLE_MAPS_API_KEY__ || '';

export const getGoogleMapsMapId = (): string =>
  import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || CHATMAPS_DEFAULT_MAP_ID;

/** Configure and load the Maps JavaScript API once for every map in the app. */
export const loadGoogleMapsLibraries = (): Promise<{ Map: any; AdvancedMarkerElement: any; RenderingType: any }> => {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return Promise.reject(new Error('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to the environment.'));
  }

  if (librariesPromise) {
    if (configuredApiKey !== apiKey) {
      return Promise.reject(new Error('Google Maps was already initialized with a different API key.'));
    }
    return librariesPromise;
  }

  configuredApiKey = apiKey;
  setOptions({ key: apiKey, v: 'weekly' });
  librariesPromise = Promise.all([
    importLibrary('maps') as Promise<any>,
    importLibrary('marker').catch(() => null) as Promise<any>
  ]).then(([mapsLibrary, markerLibrary]) => ({
    Map: mapsLibrary.Map,
    RenderingType: mapsLibrary.RenderingType,
    AdvancedMarkerElement:
      markerLibrary?.AdvancedMarkerElement || (window as any).google?.maps?.marker?.AdvancedMarkerElement
  }));

  return librariesPromise;
};
