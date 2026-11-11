/**
 * High-Accuracy GPS and Location Service for ChatMaps
 * 
 * Provides:
 * - High-accuracy GPS positioning (enableHighAccuracy: true)
 * - Real-time tracking and movement detection (watchPosition)
 * - Accuracy measurement in meters with signal quality classification
 * - Stale reading detection (> 30s)
 * - Haversine distance calculations and travel time estimates
 * - Turn-by-turn navigation URL generators
 */

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export type GpsSignalQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface LocationState {
  coords: GpsCoordinates | null;
  accuracy: number | null; // in meters
  accuracyLevel: GpsSignalQuality;
  accuracyDescription: string;
  heading: number | null; // 0-360 degrees
  speed: number | null; // meters per second
  altitude: number | null; // meters
  timestamp: number | null;
  isStale: boolean;
  isHighAccuracy: boolean;
  status: 'idle' | 'requesting' | 'tracking' | 'success' | 'error' | 'denied';
  errorMessage: string | null;
}

class LocationService {
  private watchId: number | null = null;
  private lastPosition: GeolocationPosition | null = null;
  private listeners: Set<(state: LocationState) => void> = new Set();
  private currentState: LocationState = {
    coords: null,
    accuracy: null,
    accuracyLevel: 'unknown',
    accuracyDescription: 'GPS inactive',
    heading: null,
    speed: null,
    altitude: null,
    timestamp: null,
    isStale: false,
    isHighAccuracy: false,
    status: 'idle',
    errorMessage: null
  };

  /**
   * Classify GPS accuracy according to real-world civilian GPS standards:
   * - < 10m: Excellent (Dual-Frequency / Open sky GPS)
   * - 10 - 25m: Good (Standard single-frequency GPS)
   * - 25 - 60m: Fair (Urban canyon / Wi-Fi assisted)
   * - > 60m: Poor (Cellular tower triangulation / approximate)
   */
  public classifyAccuracy(meters: number): { level: GpsSignalQuality; description: string } {
    const reportedAccuracy = `±${Math.round(meters)}m reported accuracy`;
    if (meters <= 10) {
      return {
        level: 'excellent',
        description: reportedAccuracy
      };
    }
    if (meters <= 25) {
      return {
        level: 'good',
        description: reportedAccuracy
      };
    }
    if (meters <= 60) {
      return {
        level: 'fair',
        description: reportedAccuracy
      };
    }
    return {
      level: 'poor',
      description: reportedAccuracy
    };
  }

  public getState(): LocationState {
    // Check if current reading is older than 35 seconds
    if (this.currentState.timestamp) {
      const ageSeconds = (Date.now() - this.currentState.timestamp) / 1000;
      this.currentState.isStale = ageSeconds > 35;
    }
    return { ...this.currentState };
  }

  public subscribe(listener: (state: LocationState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  /**
   * Request a single, high-accuracy GPS fix from the device.
   */
  public async getCurrentPosition(forceFresh = true): Promise<LocationState> {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const message = 'Device location requires a secure HTTPS connection. Use https:// on this device, or localhost during development.';
      this.currentState = {
        ...this.currentState,
        coords: null,
        accuracy: null,
        accuracyLevel: 'unknown',
        accuracyDescription: 'Location unavailable',
        timestamp: null,
        isHighAccuracy: false,
        status: 'error',
        errorMessage: message
      };
      this.notify();
      throw new Error(message);
    }

    if (!('geolocation' in navigator)) {
      this.currentState = {
        ...this.currentState,
        coords: null,
        accuracy: null,
        accuracyLevel: 'unknown',
        accuracyDescription: 'Location unavailable',
        timestamp: null,
        isStale: false,
        isHighAccuracy: false,
        status: 'error',
        errorMessage: 'Geolocation is not supported by your browser.'
      };
      this.notify();
      throw new Error(this.currentState.errorMessage || 'Geolocation is not supported by your browser.');
    }

    this.currentState = {
      ...this.currentState,
      status: 'requesting',
      errorMessage: null
    };
    this.notify();

    return new Promise((resolve, reject) => {
      try {
        navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handlePositionSuccess(position);
          resolve(this.getState());
        },
        (error) => {
          this.handlePositionError(error);
          reject(new Error(this.currentState.errorMessage || 'Failed to obtain GPS location.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: forceFresh ? 0 : 5000
        }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start the location request.';
        this.handleUnavailable(message);
        reject(new Error(message));
      }
    });
  }

  /**
   * Start live GPS tracking (updates as user moves).
   */
  public startTracking(onUpdate?: (state: LocationState) => void): void {
    if (this.watchId !== null) return;
    if (onUpdate) {
      this.listeners.add(onUpdate);
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      this.handleUnavailable('Device location requires HTTPS. Open ChatMaps over HTTPS on iPhone, or use localhost during development.');
      return;
    }

    if (!('geolocation' in navigator)) {
      this.handleUnavailable('Geolocation is not supported by this browser.');
      return;
    }

    this.currentState.status = 'requesting';
    this.notify();

    try {
      this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handlePositionSuccess(position);
      },
      (error) => {
        this.handlePositionError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000
      }
      );
    } catch (error) {
      this.handleUnavailable(error instanceof Error ? error.message : 'Unable to start location tracking.');
    }
  }

  /**
   * Stop active GPS tracking to save device battery.
   */
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.currentState.status = this.currentState.coords ? 'success' : 'idle';
    this.notify();
  }

  private handlePositionSuccess(pos: GeolocationPosition) {
    this.lastPosition = pos;
    const { level, description } = this.classifyAccuracy(pos.coords.accuracy);

    this.currentState = {
      coords: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      },
      accuracy: Math.round(pos.coords.accuracy),
      accuracyLevel: level,
      accuracyDescription: description,
      heading: pos.coords.heading !== null && !isNaN(pos.coords.heading) ? pos.coords.heading : null,
      speed: pos.coords.speed !== null && !isNaN(pos.coords.speed) ? pos.coords.speed : null,
      altitude: pos.coords.altitude !== null && !isNaN(pos.coords.altitude) ? pos.coords.altitude : null,
      timestamp: pos.timestamp || Date.now(),
      isStale: false,
      // The option requests high accuracy; accuracy itself is browser reported and may be coarse.
      isHighAccuracy: pos.coords.accuracy <= 25,
      status: this.watchId !== null ? 'tracking' : 'success',
      errorMessage: null
    };

    this.notify();
  }

  private handlePositionError(err: GeolocationPositionError) {
    let msg = 'Unable to retrieve location.';
    let status: LocationState['status'] = 'error';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Location permission denied. Please allow location access in your browser or device settings to find nearby street food stalls.';
        status = 'denied';
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'Your device could not determine a location. Turn on Location Services and try again.';
        break;
      case err.TIMEOUT:
        msg = 'The location request timed out. Check the signal and try again.';
        break;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.currentState = {
      ...this.currentState,
      coords: null,
      accuracy: null,
      accuracyLevel: 'unknown',
      accuracyDescription: 'Location unavailable',
      heading: null,
      speed: null,
      altitude: null,
      timestamp: null,
      isStale: false,
      isHighAccuracy: false,
      status,
      errorMessage: msg
    };
    this.notify();
  }

  private handleUnavailable(message: string) {
    this.currentState = {
      ...this.currentState,
      coords: null,
      accuracy: null,
      accuracyLevel: 'unknown',
      accuracyDescription: 'Location unavailable',
      heading: null,
      speed: null,
      altitude: null,
      timestamp: null,
      isStale: false,
      isHighAccuracy: false,
      status: 'error',
      errorMessage: message
    };
    this.notify();
  }

  /**
   * Calculate precise geographical distance between two coordinates using Haversine formula
   * Returns distance in meters.
   */
  public calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format distance into human readable string (e.g. "450 m" or "1.8 km")
   */
  public formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Estimate walking travel time based on average walking speed (4.8 km/h = 80 m/min)
   */
  public estimateWalkingTime(meters: number): string {
    const minutes = Math.max(1, Math.round(meters / 80));
    if (minutes < 60) {
      return `${minutes} min walk`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m walk`;
  }

  /**
   * Estimate driving travel time in urban Indian conditions (approx 22 km/h average)
   */
  public estimateDrivingTime(meters: number): string {
    const minutes = Math.max(1, Math.round(meters / 360));
    return `${minutes} min drive`;
  }

  /**
   * Build Google Maps directions URL from user's current GPS location to vendor stall
   */
  public getDirectionsUrl(
    from: GpsCoordinates,
    to: GpsCoordinates,
    mode: 'walking' | 'driving' = 'walking'
  ): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=${mode}`;
  }
}

export const locationService = new LocationService();
