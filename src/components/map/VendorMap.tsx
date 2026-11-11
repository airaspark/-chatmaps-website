import React, { useEffect, useRef, useState } from 'react';
import { Vendor } from '../../types';
import { useApp } from '../../context/AppContext';
import { locationService, LocationState, GpsCoordinates } from '../../services/locationService';
import {
  MapPin,
  LoaderCircle,
  CheckCircle2,
  Navigation,
  Compass,
  Star,
  Clock,
  Phone,
  ChevronRight,
  RotateCcw,
  Footprints,
  Car,
  AlertTriangle,
  Crosshair,
  ShieldCheck,
  Info
} from 'lucide-react';
import { getGoogleMapsMapId, loadGoogleMapsLibraries } from '../../services/googleMapsLoader';

interface VendorMapProps {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  onSelectVendor: (vendor: Vendor) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  showCardOverlay?: boolean;
}

/**
 * Google Maps Platform Map ID for ChatMaps:
 * Connected to:
 * - "ChatMaps Clean Map" style for light mode
 * - "Chatmaps Dark Maps" style for dark mode
 */
export const CHATMAPS_MAP_ID = getGoogleMapsMapId();

/**
 * Returns SVG markup for custom orange ChatMaps vendor map pins
 */
const getPinSvgMarkup = (isSelected: boolean, isOpen: boolean, width: number, height: number): string => {
  const primaryOrange = isSelected ? '#EA580C' : isOpen ? '#F97316' : '#78716C';
  const darkOrange = isSelected ? '#C2410C' : isOpen ? '#EA580C' : '#57534E';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 36 44">
      <defs>
        <filter id="chatmapsShadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="rgba(0,0,0,0.40)"/>
        </filter>
        <linearGradient id="cmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${primaryOrange}"/>
          <stop offset="100%" stop-color="${darkOrange}"/>
        </linearGradient>
      </defs>
      <!-- Teardrop Pin Body -->
      <path filter="url(#chatmapsShadow)" fill="url(#cmGrad)" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M18 2 C9.7 2 3 8.7 3 17 C3 27.5 16.5 40.8 17.2 41.5 C17.6 41.9 18.4 41.9 18.8 41.5 C19.5 40.8 33 27.5 33 17 C33 8.7 26.3 2 18 2 Z"/>
      <!-- Inner White Circle -->
      <circle cx="18" cy="17" r="7.5" fill="#FFFFFF"/>
      <!-- Brand Orange Core -->
      <circle cx="18" cy="17" r="4.5" fill="${isOpen ? '#EA580C' : '#78716C'}"/>
      ${isOpen ? '<circle cx="18" cy="17" r="2" fill="#FED7AA"/>' : ''}
    </svg>
  `.trim();
};

/**
 * Creates custom DOM element for AdvancedMarkerElement
 */
const createChatMapsAdvancedPinElement = (isSelected: boolean, isOpen: boolean): HTMLElement => {
  const width = isSelected ? 44 : 36;
  const height = isSelected ? 52 : 44;
  const wrapper = document.createElement('div');
  wrapper.className = `chatmaps-marker-pin transition-transform duration-200 cursor-pointer ${
    isSelected ? 'scale-110 drop-shadow-xl' : 'hover:scale-105 drop-shadow-md'
  }`;
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.innerHTML = getPinSvgMarkup(isSelected, isOpen, width, height);
  return wrapper;
};

/**
 * Distinctive Blue User Location Marker Element (High Accuracy Pulse)
 */
const createUserLocationPinElement = (heading: number | null): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative flex items-center justify-center';
  wrapper.style.width = '36px';
  wrapper.style.height = '36px';

  wrapper.innerHTML = `
    <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: absolute; width: 18px; height: 18px; border-radius: 9999px; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);"></div>
    ${
      heading !== null
        ? `<div style="position: absolute; top: -6px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #2563EB; transform: rotate(${heading}deg); transform-origin: 50% 24px;"></div>`
        : ''
    }
  `;
  return wrapper;
};

export const VendorMap: React.FC<VendorMapProps> = ({
  vendors,
  selectedVendor,
  onSelectVendor,
  center = { lat: 0, lng: 0 },
  zoom = 2,
  className = 'h-full w-full',
  showCardOverlay = true
}) => {
  const { theme, gpsActive } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>(() => locationService.getState());
  const [accuracyModalOpen, setAccuracyModalOpen] = useState(false);

  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const userAccuracyCircleRef = useRef<any>(null);
  const advancedMarkerClassRef = useRef<any>(null);
  const hasInitialVendorViewportRef = useRef(false);
  const hasCenteredOnGpsRef = useRef(false);
  const followUserRef = useRef(false);

  // Subscribe to location updates
  useEffect(() => {
    const unsubscribe = locationService.subscribe((loc) => {
      setLocationState(loc);
    });
    return () => unsubscribe();
  }, []);

  // Initialize Google Maps with Map ID
  useEffect(() => {
    let isCancelled = false;
    let tilesTimeout: number | undefined;
    let tilesLoadedListener: any;

    const handleMapsAuthFailure = () => {
      if (tilesTimeout !== undefined) window.clearTimeout(tilesTimeout);
      console.error('Google Maps authentication failed. Check the API key restrictions and Maps JavaScript API access.');
      setMapLoaded(false);
      setMapLoading(false);
      setMapError('Google Maps rejected the API key. Check that the key is active, allowed for this domain, and has the Maps JavaScript API enabled.');
    };

    if (!mapRef.current) {
      setMapLoaded(false);
      setMapLoading(false);
      setMapError('The Google Map container is not available.');
      return;
    }

    window.addEventListener('gm_authFailure', handleMapsAuthFailure);

    async function loadMapsApi() {
      setMapLoading(true);
      setMapError(null);
      try {
        const { Map, AdvancedMarkerElement, RenderingType } = await loadGoogleMapsLibraries();
        advancedMarkerClassRef.current = AdvancedMarkerElement;

        if (isCancelled || !mapRef.current) return;

        const colorSchemeMode = theme === 'dark' ? 'DARK' : 'LIGHT';

        const mapOptions: any = {
          center,
          zoom,
          mapId: CHATMAPS_MAP_ID,
          // Keep cloud styling but use raster tiles to avoid the failing WebGL vector renderer.
          renderingType: RenderingType.RASTER,
          colorScheme: colorSchemeMode,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        };

        const gMap = new Map(mapRef.current, mapOptions);
        googleMapInstanceRef.current = gMap;
        setMapLoaded(true);
        tilesLoadedListener = gMap.addListener('tilesloaded', () => {
          if (tilesTimeout !== undefined) window.clearTimeout(tilesTimeout);
          if (!isCancelled) {
            setMapLoading(false);
            setMapError(null);
          }
        });
        tilesTimeout = window.setTimeout(() => {
          if (!isCancelled) {
            const bounds = mapRef.current?.getBoundingClientRect();
            setMapLoading(false);
            setMapError(!bounds || bounds.width === 0 || bounds.height === 0
              ? `The map container has no visible size (${Math.round(bounds?.width || 0)} × ${Math.round(bounds?.height || 0)} px). Rotate the phone or reload the page.`
              : `Google Maps initialized in a ${Math.round(bounds.width)} × ${Math.round(bounds.height)} px area, but map tiles did not load. On iPhone Safari, check the phone’s internet connection and allow maps.googleapis.com and gstatic.com in content blockers, then reload.`);
          }
        }, 15000);

      } catch (err: any) {
        console.error('Google Maps JavaScript API failed to initialize:', err);
        if (!isCancelled) {
          setMapLoaded(false);
          setMapLoading(false);
          const message = typeof err?.message === 'string' ? err.message : '';
          setMapError(
            `Google Maps could not load${message ? `: ${message}` : '.'} Check that the Maps JavaScript API is enabled, the API key is valid and allowed for this domain, and the configured Map ID is available.`
          );
        }
      }
    }

    loadMapsApi();

    return () => {
      isCancelled = true;
      if (tilesTimeout !== undefined) window.clearTimeout(tilesTimeout);
      tilesLoadedListener?.remove?.();
      window.removeEventListener('gm_authFailure', handleMapsAuthFailure);
    };
  }, []);

  // Update Google Maps theme dynamically
  useEffect(() => {
    if (googleMapInstanceRef.current) {
      const colorSchemeMode = theme === 'dark' ? 'DARK' : 'LIGHT';
      try {
        googleMapInstanceRef.current.setOptions({
          colorScheme: colorSchemeMode,
        });
      } catch (err) {
        console.debug('colorScheme update error:', err);
      }
    }
  }, [theme]);

  // Update Vendor Markers (Only approved Firestore vendors)
  useEffect(() => {
    if (!mapLoaded || !googleMapInstanceRef.current) return;

    markersRef.current.forEach((m) => {
      if (typeof m.setMap === 'function') m.setMap(null);
      else m.map = null;
    });
    markersRef.current = [];

    const gMap = googleMapInstanceRef.current;
    const AdvancedMarker = advancedMarkerClassRef.current;
    const hasGoogleMarker = typeof (window as any).google?.maps?.Marker === 'function';

    vendors.forEach((vendor) => {
      if (!vendor.location || !Number.isFinite(vendor.location.lat) || !Number.isFinite(vendor.location.lng)) return;
      const isSelected = selectedVendor?.id === vendor.id;
      const position = { lat: vendor.location.lat, lng: vendor.location.lng };
      const title = `${vendor.shopName} (${vendor.isOpen ? 'Open' : 'Closed'})`;

      if (AdvancedMarker) {
        const pinContent = createChatMapsAdvancedPinElement(isSelected, vendor.isOpen);
        const marker = new AdvancedMarker({
          map: gMap,
          position,
          title,
          content: pinContent,
          zIndex: isSelected ? 999 : 10
        });

        marker.addListener('click', () => {
          onSelectVendor(vendor);
        });

        markersRef.current.push(marker);
      } else if (hasGoogleMarker) {
        const marker = new (window as any).google.maps.Marker({
          position,
          map: gMap,
          title,
          zIndex: isSelected ? 999 : 10
        });

        marker.addListener('click', () => {
          onSelectVendor(vendor);
        });

        markersRef.current.push(marker);
      }
    });
  }, [mapLoaded, vendors, selectedVendor, onSelectVendor]);

  // Update Blue User Location Marker & Accuracy Circle
  useEffect(() => {
    if (!mapLoaded || !googleMapInstanceRef.current) return;

    const gMap = googleMapInstanceRef.current;
    const AdvancedMarker = advancedMarkerClassRef.current;

    // 1. Remove previous user marker and circle
    if (userMarkerRef.current) {
      if (typeof userMarkerRef.current.setMap === 'function') userMarkerRef.current.setMap(null);
      else userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    }

    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.setMap(null);
      userAccuracyCircleRef.current = null;
    }

    if (!locationState.coords) return;
    const coords = locationState.coords;

    // 2. Render Accuracy Radius Circle
    if (locationState.accuracy !== null && (window as any).google?.maps?.Circle) {
      const circle = new (window as any).google.maps.Circle({
        map: gMap,
        center: coords,
        radius: locationState.accuracy,
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        strokeColor: '#2563EB',
        strokeOpacity: 0.35,
        strokeWeight: 1,
        zIndex: 5
      });
      userAccuracyCircleRef.current = circle;
    }

    // 3. Render User Marker
    if (AdvancedMarker) {
      const pinContent = createUserLocationPinElement(locationState.heading);
      const marker = new AdvancedMarker({
        map: gMap,
        position: coords,
        title: `Your Location (${locationState.accuracyDescription})`,
        content: pinContent,
        zIndex: 1000
      });
      userMarkerRef.current = marker;
    } else if (typeof (window as any).google?.maps?.Marker === 'function') {
      const marker = new (window as any).google.maps.Marker({
        position: coords,
        map: gMap,
        title: 'Your Location',
        zIndex: 1000
      });
      userMarkerRef.current = marker;
    }
  }, [mapLoaded, locationState.coords, locationState.accuracy, locationState.heading]);

  // Fit vendor data initially when GPS is unavailable, then focus the first credible GPS fix.
  useEffect(() => {
    const gMap = googleMapInstanceRef.current;
    if (!mapLoaded || !gMap || !locationState.coords) return;
    if (locationState.accuracy !== null && locationState.accuracy <= 1000 && !hasCenteredOnGpsRef.current) {
      gMap.panTo(locationState.coords);
      gMap.setZoom(14);
      hasCenteredOnGpsRef.current = true;
      hasInitialVendorViewportRef.current = true;
    } else if (followUserRef.current) {
      gMap.panTo(locationState.coords);
    }
  }, [mapLoaded, locationState.coords, locationState.timestamp, locationState.accuracy]);

  useEffect(() => {
    const gMap = googleMapInstanceRef.current;
    if (!mapLoaded || !gMap || hasInitialVendorViewportRef.current) return;
    if (locationState.coords && locationState.accuracy !== null && locationState.accuracy <= 1000) return;

    const validVendors = vendors.filter((vendor) =>
      Number.isFinite(vendor.location?.lat) && Number.isFinite(vendor.location?.lng)
    );
    if (validVendors.length === 0) return;

    const maps = (window as any).google?.maps;
    if (!maps?.LatLngBounds) return;
    const bounds = new maps.LatLngBounds();
    validVendors.forEach((vendor) => bounds.extend(vendor.location));
    gMap.fitBounds(bounds, 48);
    if (validVendors.length === 1) gMap.setZoom(13);
    hasInitialVendorViewportRef.current = true;
  }, [mapLoaded, vendors, locationState.coords, locationState.accuracy]);

  useEffect(() => {
    if (!gpsActive) followUserRef.current = false;
  }, [gpsActive]);

  useEffect(() => {
    if (locationState.status !== 'requesting') setIsLocating(false);
  }, [locationState.status]);

  // Handle Recenter My Location with High Accuracy GPS
  const handleRecenterLocation = () => {
    followUserRef.current = true;
    setIsLocating(true);
    if (locationState.coords && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo(locationState.coords);
      googleMapInstanceRef.current.setZoom(15);
      setIsLocating(false);
    }
    locationService.startTracking();
  };

  // Compute live distance & travel times between user GPS and selected vendor
  let distanceText: string | null = null;
  let walkTimeText: string | null = null;
  let driveTimeText: string | null = null;
  let directionsUrl: string = '#';

  if (selectedVendor && selectedVendor.location && locationState.coords) {
    const meters = locationService.calculateDistanceMeters(
      locationState.coords.lat,
      locationState.coords.lng,
      selectedVendor.location.lat,
      selectedVendor.location.lng
    );
    distanceText = locationService.formatDistance(meters);
    walkTimeText = locationService.estimateWalkingTime(meters);
    driveTimeText = locationService.estimateDrivingTime(meters);
    directionsUrl = locationService.getDirectionsUrl(
      locationState.coords,
      selectedVendor.location,
      'walking'
    );
  } else if (selectedVendor?.location) {
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedVendor.location.lat},${selectedVendor.location.lng}`;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 ${className}`}>
      {/* Real Google Maps Container */}
      <div ref={mapRef} className={`absolute inset-0 h-full w-full ${!mapLoaded ? 'invisible' : 'visible'}`} />

      {mapLoaded && !mapLoading && !mapError && (
        <div role="status" className="absolute left-4 top-20 z-20 flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-md dark:border-emerald-900 dark:bg-stone-900/95 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Google Map ready
        </div>
      )}

      {(mapLoading || mapError) && (
        <div role={mapError ? 'alert' : 'status'} className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100 px-6 text-center dark:bg-stone-900">
          <div className="max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-stone-950">
            {mapLoading ? (
              <>
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-orange-600" aria-hidden="true" />
                <p className="mt-3 font-semibold text-stone-800 dark:text-stone-100">Loading Google Map…</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">This can take a few seconds on mobile.</p>
              </>
            ) : (
              <>
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
                <p className="mt-3 font-bold text-stone-900 dark:text-stone-100">Map unavailable</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{mapError || 'Google Maps could not be initialized. Check the browser console for the Maps JavaScript API error.'}</p>
                <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">Reload map</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating GPS Accuracy Status Badge */}
      <div className="absolute left-4 top-4 z-20">
        <button
          onClick={() => setAccuracyModalOpen(!accuracyModalOpen)}
          className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 shadow-md flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-200 active:scale-95 transition"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              locationState.accuracyLevel === 'excellent'
                ? 'bg-emerald-500 animate-pulse'
                : locationState.accuracyLevel === 'good'
                ? 'bg-teal-500'
                : locationState.accuracyLevel === 'fair'
                ? 'bg-amber-500'
                : 'bg-stone-400'
            }`}
          />
          <span>{locationState.errorMessage ? 'Location unavailable' : locationState.accuracyDescription}</span>
          <Info className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

      {/* Floating Controls: Recenter My Location & Refresh */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenterLocation}
          disabled={isLocating}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-600 active:scale-95 transition group"
          title="Recenter My Location"
        >
          <Navigation className={`w-5 h-5 text-blue-600 ${isLocating ? 'animate-spin text-orange-600' : 'group-hover:rotate-45 transition-transform'}`} />
        </button>

        <button
          onClick={handleRecenterLocation}
          disabled={isLocating}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-600 active:scale-95 transition"
          title="Refresh GPS Fix"
        >
          <RotateCcw className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      {/* GPS Accuracy Info Modal */}
      {accuracyModalOpen && (
        <div className="absolute top-14 left-4 z-30 max-w-xs bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between font-bold border-b border-stone-100 dark:border-stone-800 pb-2">
            <span className="flex items-center gap-1.5 text-stone-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Location Accuracy</span>
            </span>
            <button onClick={() => setAccuracyModalOpen(false)} className="text-stone-400 font-bold hover:text-stone-600">
              ✕
            </button>
          </div>

          <div className="space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-stone-500">Reported Radius:</span>
              <span className="font-bold text-orange-600">{locationState.accuracy !== null ? `±${locationState.accuracy} m` : 'Not available'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">GPS Mode:</span>
              <span className="font-bold text-emerald-600">{locationState.status === 'requesting' ? 'Requesting location' : locationState.status === 'success' || locationState.status === 'tracking' ? 'Location acquired' : 'Unavailable'}</span>
            </div>
            {locationState.errorMessage && <p role="alert" className="rounded-lg bg-amber-50 p-2 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">{locationState.errorMessage}</p>}
            {locationState.coords && (
              <div className="flex justify-between font-mono text-[10px] text-stone-400 pt-1">
                <span>Coordinates:</span>
                <span>{locationState.coords.lat.toFixed(5)}, {locationState.coords.lng.toFixed(5)}</span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
            Location is requested only when you choose a GPS control. Browser geolocation requires a secure HTTPS connection, except on localhost.
          </p>

          <button
            onClick={() => {
              void handleRecenterLocation();
              setAccuracyModalOpen(false);
            }}
            className="w-full py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition"
          >
            Force High-Accuracy Refresh
          </button>
        </div>
      )}

      {/* Selected Vendor Drawer / Card Overlay with Live Distance */}
      {showCardOverlay && selectedVendor && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 animate-fade-in-up">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 shadow-2xl border border-stone-200 dark:border-stone-800 flex gap-3.5 items-center relative text-stone-900 dark:text-stone-100">
            <img
              src={selectedVendor.bannerImage || selectedVendor.photos[0]}
              alt={selectedVendor.shopName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  selectedVendor.isOpen
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}>
                  {selectedVendor.isOpen ? 'Open Now' : 'Closed'}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
                  {selectedVendor.category}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate mt-1">
                {selectedVendor.shopName}
              </h4>

              {/* Live Distance and Estimated Walking Travel Time */}
              {distanceText && (
                <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{distanceText}</span>
                  </span>
                  <span>•</span>
                  <span>{walkTimeText}</span>
                </div>
              )}

              <p className="text-xs text-stone-500 dark:text-stone-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                <span>{selectedVendor.address}</span>
              </p>
              {selectedVendor.gpsAccuracy !== undefined && (
                <p className="text-[10px] text-stone-500 mt-0.5">GPS ±{selectedVendor.gpsAccuracy} m · Updated {selectedVendor.lastLocationAt ? new Date(selectedVendor.lastLocationAt).toLocaleTimeString() : 'time unavailable'}</p>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{selectedVendor.rating}</span>
                  <span className="text-stone-400 font-normal">({selectedVendor.reviewCount})</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition shadow-xs flex items-center gap-1 text-xs font-bold"
                    title="Get Walking Directions"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="hidden sm:inline">Directions</span>
                  </a>
                  <a
                    href={`tel:${selectedVendor.phone}`}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition"
                    title="Call Stall"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`/vendor/${selectedVendor.id}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-600 text-white font-extrabold text-xs hover:bg-orange-700 transition shadow-xs"
                  >
                    <span>Menu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
