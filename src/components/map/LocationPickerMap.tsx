import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Check, Crosshair, Sparkles, LoaderCircle, AlertTriangle } from 'lucide-react';
import { locationService } from '../../services/locationService';
import { getGoogleMapsMapId, loadGoogleMapsLibraries } from '../../services/googleMapsLoader';

interface LocationPickerMapProps {
  location: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number; addressHint?: string }) => void;
  address?: string;
}

const CITY_PRESETS = [
  { name: 'Bangalore (Indiranagar / VV Puram)', lat: 12.9716, lng: 77.5946 },
  { name: 'Mysuru (Devaraja Market / Chamundi)', lat: 12.3052, lng: 76.6552 },
  { name: 'Mumbai (Vile Parle / Chowpatty)', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi (Chandni Chowk / CP)', lat: 28.6139, lng: 77.2090 },
  { name: 'Jaipur (Badi Chaupar / MI Road)', lat: 26.9124, lng: 75.7873 },
  { name: 'Hyderabad (Charminar / Madhapur)', lat: 17.3850, lng: 78.4867 }
];

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  location,
  onChange,
  address = ''
}) => {
  const [currentLoc, setCurrentLoc] = useState(location);
  const [accuracyMsg, setAccuracyMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    const initializePickerMap = async () => {
      try {
        const { Map, AdvancedMarkerElement, RenderingType } = await loadGoogleMapsLibraries();
        if (isCancelled || !mapElementRef.current) return;

        const map = new Map(mapElementRef.current, {
          center: currentLoc,
          zoom: 14,
          mapId: getGoogleMapsMapId(),
          renderingType: RenderingType.RASTER,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });
        mapInstanceRef.current = map;

        if (AdvancedMarkerElement) {
          markerRef.current = new AdvancedMarkerElement({ map, position: currentLoc, title: 'Stall location' });
        } else if ((window as any).google?.maps?.Marker) {
          markerRef.current = new (window as any).google.maps.Marker({ map, position: currentLoc, title: 'Stall location' });
        }

        map.addListener('click', (event: any) => {
          const point = event.latLng;
          if (!point) return;
          const next = { lat: point.lat(), lng: point.lng() };
          setCurrentLoc(next);
          onChange(next);
          setAccuracyMsg('Pin adjusted manually');
          if (markerRef.current) {
            if ('position' in markerRef.current) markerRef.current.position = next;
            else markerRef.current.setPosition(next);
          }
        });
        setMapLoading(false);
      } catch (error: any) {
        if (!isCancelled) {
          setMapLoading(false);
          setMapError(error?.message || 'Google Maps could not initialize the location picker.');
        }
      }
    };

    initializePickerMap();
    return () => { isCancelled = true; };
  }, []);

  const handlePresetSelect = (preset: typeof CITY_PRESETS[0]) => {
    const next = { lat: preset.lat, lng: preset.lng, addressHint: preset.name };
    setCurrentLoc(next);
    onChange(next);
    setAccuracyMsg(null);
    mapInstanceRef.current?.panTo({ lat: next.lat, lng: next.lng });
    if (markerRef.current) {
      if ('position' in markerRef.current) markerRef.current.position = next;
      else markerRef.current.setPosition(next);
    }
  };

  const handleGetCurrentPosition = async () => {
    setIsLocating(true);
    setAccuracyMsg('Acquiring high-precision GPS lock...');
    try {
      const loc = await locationService.getCurrentPosition(true);
      if (loc.coords) {
        const next = {
          lat: Number(loc.coords.lat.toFixed(5)),
          lng: Number(loc.coords.lng.toFixed(5)),
        };
        setCurrentLoc(next);
        onChange(next);
        setAccuracyMsg(`GPS Lock: ${loc.accuracyDescription}`);
        mapInstanceRef.current?.panTo(next);
        if (markerRef.current) {
          if ('position' in markerRef.current) markerRef.current.position = next;
          else markerRef.current.setPosition(next);
        }
      }
    } catch (err: any) {
      setAccuracyMsg(err?.message || 'Unable to acquire device location.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>Pin Stall Coordinates (High-Accuracy Lat & Lng)</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentPosition}
          disabled={isLocating}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 active:scale-95 transition"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locking GPS...' : 'Use High-Accuracy GPS'}</span>
        </button>
      </div>

      {accuracyMsg && (
        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>{accuracyMsg}</span>
        </div>
      )}

      {/* Preset Indian Food Hubs */}
      <div className="flex flex-wrap gap-1.5">
        {CITY_PRESETS.map((p) => {
          const isSelected = Math.abs(currentLoc.lat - p.lat) < 0.01;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-600 font-semibold shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
              {p.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Clickable Map Picker Canvas */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border-2 border-dashed border-orange-300 bg-stone-100 shadow-inner dark:border-orange-700/60 dark:bg-stone-800">
        <div ref={mapElementRef} className="absolute inset-0 h-full w-full" />
        {mapLoading && <div role="status" className="absolute inset-0 flex items-center justify-center bg-stone-100/90 dark:bg-stone-900/90"><span className="flex items-center gap-2 text-xs font-semibold"><LoaderCircle className="h-4 w-4 animate-spin" />Loading Google Map…</span></div>}
        {mapError && <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/95 px-3 text-center text-xs text-amber-800 dark:bg-stone-900/95 dark:text-amber-200"><AlertTriangle className="mb-1 h-5 w-5" />{mapError}</div>}

        {/* Selected Coordinates Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between text-stone-700 dark:text-stone-200">
          <span className="truncate max-w-[200px]">
            {address || 'Stall Pinpoint'}
          </span>
          <span className="font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0">
            {currentLoc.lat.toFixed(5)}, {currentLoc.lng.toFixed(5)}
          </span>
        </div>
      </div>
    </div>
  );
};
