import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GpsCoordinates, locationService } from '../services/locationService';
import { reverseGeocodeCity } from '../services/cityGeocodingService';

export type Language = 'en' | 'kn';
export type Theme = 'light' | 'dark';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedState: string | null;
  selectedLocality: string | null;
  locationSource: 'unknown' | 'gps' | 'manual' | 'unavailable';
  locationError: string | null;
  customerCoordinates: GpsCoordinates | null;
  isDetectingLocation: boolean;
  detectCurrentLocation: () => Promise<boolean>;
  clearSelectedCity: () => void;
  gpsActive: boolean;
  toggleGps: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    greeting: 'Namaskara',
    locationUnavailable: 'Location unavailable',
    gpsLive: 'GPS Live',
    searchPlaceholder: 'Search street food (e.g. Pani Puri, Dosa, Gobi Manchurian)',
    openNow: 'Open Now',
    within2km: 'Within 2 km',
    nearest: 'Nearest',
    exploreMysuru: 'EXPLORE MYSURU',
    tasteMysuru: 'Taste Mysuru',
    exploreMysuruSub: 'Explore street foods around your location.',
    whatAreYouCraving: 'WHAT ARE YOU CRAVING?',
    seeAll: 'See All',
    nearbyCartsAndStalls: 'NEARBY CARTS & STALLS',
    home: 'HOME',
    liveMap: 'LIVE MAP',
    calories: 'CALORIES',
    favorites: 'FAVORITES',
    profile: 'PROFILE',
    explore: 'Explore',
    about: 'About',
    contact: 'Contact',
    customerLogin: 'Customer Login',
    vendorLogin: 'Vendor Login',
    registerStall: 'Register Your Stall',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    languageName: 'English',
    editAccount: 'Edit Account',
    accountSettings: 'Account Settings',
    languageSettings: 'Language Settings',
    themeSettings: 'Theme Settings',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    deleteAccount: 'Delete Account',
    logout: 'Logout',
    open: 'OPEN',
    closed: 'CLOSED',
    todayIntake: "Today's Intake",
    dailyTarget: 'Daily Target',
    trackCalories: 'Track Street Food Calories',
    searchFoodCalories: 'Search food (e.g. Pani Puri, Dosa, Gobi)...',
    portion: 'Portion',
    carbs: 'Carbs',
    protein: 'Protein',
    fat: 'Fat',
    addFood: 'Add to Today',
    loggedItems: 'Logged Street Foods',
    noItemsLogged: 'No street food logged today yet.',
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ',
    locationUnavailable: 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ',
    gpsLive: 'ಜಿಪಿಎಸ್ ಲೈವ್',
    searchPlaceholder: 'ಆಹಾರ, ಗಾಡಿಗಳು, ಚಹಾ ಹುಡುಕಿ...',
    openNow: 'ಈಗ ತೆರೆದಿದೆ',
    within2km: '2 ಕಿ.ಮೀ ಒಳಗೆ',
    nearest: 'ಹತ್ತಿರದ',
    exploreMysuru: 'ಮೈಸೂರು ಅನ್ವೇಷಿಸಿ',
    tasteMysuru: 'ಮೈಸೂರಿನ ರುಚಿ',
    exploreMysuruSub: 'ನಿಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಬೀದಿ ಆಹಾರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
    whatAreYouCraving: 'ನಿಮಗೆ ಏನು ತಿನ್ನಬೇಕು?',
    seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    nearbyCartsAndStalls: 'ಹತ್ತಿರದ ಗಾಡಿಗಳು ಮತ್ತು ಅಂಗಡಿಗಳು',
    home: 'ಮುಖಪುಟ',
    liveMap: 'ಲೈವ್ ನಕ್ಷೆ',
    calories: 'ಕ್ಯಾಲೋರಿಗಳು',
    favorites: 'ಮೆಚ್ಚಿನವು',
    profile: 'ಪ್ರೊಫೈಲ್',
    explore: 'ಅನ್ವೇಷಿಸಿ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
    customerLogin: 'ಗ್ರಾಹಕ ಲಾಗಿನ್',
    vendorLogin: 'ವ್ಯಾಪಾರಿ ಲಾಗಿನ್',
    registerStall: 'ನಿಮ್ಮ ಅಂಗಡಿ ನೋಂದಾಯಿಸಿ',
    lightMode: 'ಬೆಳಕಿನ ಮೋಡ್',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    languageName: 'ಕನ್ನಡ',
    editAccount: 'ಖಾತೆ ಸಂಪಾದಿಸಿ',
    accountSettings: 'ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    languageSettings: 'ಭಾಷಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    themeSettings: 'ಥೀಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    termsConditions: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
    deleteAccount: 'ಖಾತೆ ಅಳಿಸಿ',
    logout: 'ಲಾಗ್ ಔಟ್',
    open: 'ತೆರೆದಿದೆ',
    closed: 'ಮುಚ್ಚಿದೆ',
    todayIntake: 'ಇಂದಿನ ಕ್ಯಾಲೋರಿಗಳು',
    dailyTarget: 'ದೈನಂದಿನ ಗುರಿ',
    trackCalories: 'ಬೀದಿ ಆಹಾರ ಕ್ಯಾಲೋರಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    searchFoodCalories: 'ಆಹಾರ ಹುಡುಕಿ (ಉದಾ. ಪಾನಿ ಪುರಿ, ದೋಸೆ, ಗೋಬಿ)...',
    portion: 'ಪ್ರಮಾಣ',
    carbs: 'ಕಾರ್ಬ್ಸ್',
    protein: 'ಪ್ರೋಟೀನ್',
    fat: 'ಕೊಬ್ಬು',
    addFood: 'ಇಂದಿಗೆ ಸೇರಿಸಿ',
    loggedItems: 'ದಾಖಲಾದ ಆಹಾರಗಳು',
    noItemsLogged: 'ಇಂದು ಯಾವುದೇ ಆಹಾರ ದಾಖಲಾಗಿಲ್ಲ.',
  }
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Hot & Fresh Masala Dosa!',
    message: 'Shri Sagar Masala Dosa just fired up the tawa at VV Puram.',
    time: '5m ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Gobi Manchurian Special',
    message: 'Anand Chowpatty now serving crispy mineral water Pani Puri.',
    time: '25m ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'New Stall Verified in Mysuru',
    message: 'Chamundi Chats near Devaraja Market verified and open now.',
    time: '1h ago',
    read: true,
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('chatmaps_theme') as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('chatmaps_lang') as Language;
      if (saved === 'en' || saved === 'kn') return saved;
    } catch {}
    return 'en';
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try {
      return (localStorage.getItem('chatmaps_selected_city') || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    } catch {}
    return '';
  });

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<'unknown' | 'gps' | 'manual' | 'unavailable'>(() => {
    try {
      const source = localStorage.getItem('chatmaps_location_source');
      if (source === 'manual' && localStorage.getItem('chatmaps_selected_city')) return 'manual';
      // A city saved by the old picker was a user selection, not a GPS result.
      if (!source && localStorage.getItem('chatmaps_selected_city')) return 'manual';
    } catch {}
    return 'unknown';
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [customerCoordinates, setCustomerCoordinates] = useState<GpsCoordinates | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const gpsTrackingRef = useRef(false);
  const manualCitySelectedRef = useRef(locationSource === 'manual');
  const lastSuccessfulGeocodeCoordinatesRef = useRef<GpsCoordinates | null>(null);
  const gpsCityAvailableRef = useRef(false);
  const geocodeInProgressRef = useRef(false);
  const locationRequestInProgressRef = useRef(false);
  const lastCityGeocodeRef = useRef<{ coordinates: GpsCoordinates; at: number } | null>(null);
  const locationSelectionGenerationRef = useRef(0);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('chatmaps_notifs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_NOTIFICATIONS;
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('chatmaps_theme', theme);
    } catch {}
  }, [theme]);

  // Save language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('chatmaps_lang', lang);
    } catch {}
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetCity = useCallback((city: string) => {
    const cleanCity = city.trim();
    if (!cleanCity) return;
    locationSelectionGenerationRef.current += 1;
    gpsTrackingRef.current = false;
    locationService.stopTracking();
    setGpsActive(false);
    setSelectedCity(cleanCity);
    setSelectedState(null);
    setSelectedLocality(null);
    setLocationSource('manual');
    manualCitySelectedRef.current = true;
    gpsCityAvailableRef.current = false;
    setLocationError(null);
    try {
      localStorage.setItem('chatmaps_selected_city', cleanCity);
      localStorage.setItem('chatmaps_location_source', 'manual');
    } catch {}
  }, []);

  const clearSelectedCity = useCallback(() => {
    locationSelectionGenerationRef.current += 1;
    gpsTrackingRef.current = false;
    locationService.stopTracking();
    setGpsActive(false);
    setSelectedCity('');
    setSelectedState(null);
    setSelectedLocality(null);
    setLocationSource('unknown');
    manualCitySelectedRef.current = false;
    gpsCityAvailableRef.current = false;
    setLocationError(null);
    try {
      localStorage.removeItem('chatmaps_selected_city');
      localStorage.removeItem('chatmaps_location_source');
    } catch {}
  }, []);

  const applyGpsCity = useCallback(async (coordinates: GpsCoordinates, generation = locationSelectionGenerationRef.current): Promise<boolean> => {
    const previous = lastSuccessfulGeocodeCoordinatesRef.current;
    if (gpsCityAvailableRef.current && previous && locationService.calculateDistanceMeters(previous.lat, previous.lng, coordinates.lat, coordinates.lng) < 100) return true;
    if (geocodeInProgressRef.current) return false;
    geocodeInProgressRef.current = true;
    try {
      const address = await reverseGeocodeCity(coordinates);
      if (generation !== locationSelectionGenerationRef.current) return false;
      setSelectedCity(address.city);
      setSelectedState(address.state);
      setSelectedLocality(address.locality);
      setLocationSource('gps');
      manualCitySelectedRef.current = false;
      lastSuccessfulGeocodeCoordinatesRef.current = coordinates;
      gpsCityAvailableRef.current = true;
      setLocationError(null);
      // Google geocoding content is intentionally kept in memory only.
      try {
        localStorage.removeItem('chatmaps_selected_city');
        localStorage.removeItem('chatmaps_location_source');
      } catch {}
      return true;
    } catch (error) {
      if (generation === locationSelectionGenerationRef.current) {
        setLocationError(error instanceof Error ? error.message : 'Could not identify your city. Select it manually.');
        if (!manualCitySelectedRef.current) {
          setSelectedCity('');
          setSelectedState(null);
          setSelectedLocality(null);
          setLocationSource('unavailable');
          gpsCityAvailableRef.current = false;
        }
      }
      return false;
    } finally {
      geocodeInProgressRef.current = false;
    }
  }, []);

  const detectCurrentLocation = useCallback(async (): Promise<boolean> => {
    if (locationRequestInProgressRef.current) return false;
    locationRequestInProgressRef.current = true;
    setIsDetectingLocation(true);
    setLocationError(null);
    const generation = ++locationSelectionGenerationRef.current;
    try {
      const fix = await locationService.getCurrentPosition(true);
      if (!fix.coords || !Number.isFinite(fix.coords.lat) || !Number.isFinite(fix.coords.lng)) {
        throw new Error('Your device did not return valid coordinates. Select your city manually.');
      }
      setCustomerCoordinates(fix.coords);
      if (fix.accuracy === null || fix.accuracy > 1000) {
        throw new Error(`GPS accuracy is too low to identify your city (±${fix.accuracy ?? 'unknown'}m). Try again outdoors or select your city manually.`);
      }
      lastCityGeocodeRef.current = { coordinates: fix.coords, at: Date.now() };
      return await applyGpsCity(fix.coords, generation);
    } catch (error) {
      if (!manualCitySelectedRef.current) {
        setSelectedCity('');
        setSelectedState(null);
        setSelectedLocality(null);
        setLocationSource('unavailable');
        gpsCityAvailableRef.current = false;
      }
      setLocationError(error instanceof Error ? error.message : 'Location is unavailable. Select your city manually.');
      return false;
    } finally {
      locationRequestInProgressRef.current = false;
      setIsDetectingLocation(false);
    }
  }, [applyGpsCity]);

  useEffect(() => {
    return locationService.subscribe((location) => {
      const tracking = location.status === 'tracking' && location.coords !== null;
      setGpsActive(tracking);
      if (location.coords && location.timestamp && Date.now() - location.timestamp < 120_000) {
        setCustomerCoordinates(location.coords);
      }
      if (gpsTrackingRef.current && (location.status === 'denied' || location.status === 'error')) {
        gpsTrackingRef.current = false;
        setLocationError(location.errorMessage || 'GPS is unavailable. Select your city manually or try again.');
      }
      if (!gpsTrackingRef.current || !tracking || !location.coords) return;

      const previous = lastCityGeocodeRef.current;
      const movedMeters = previous
        ? locationService.calculateDistanceMeters(previous.coordinates.lat, previous.coordinates.lng, location.coords.lat, location.coords.lng)
        : Number.POSITIVE_INFINITY;
      const waitedLongEnough = !previous || Date.now() - previous.at >= 5 * 60_000;
      if (movedMeters >= 15_000 && waitedLongEnough) {
        lastCityGeocodeRef.current = { coordinates: location.coords, at: Date.now() };
        void applyGpsCity(location.coords);
      }
    });
  }, [applyGpsCity]);

  const toggleGps = useCallback(() => {
    if (isDetectingLocation) return;
    if (gpsTrackingRef.current) {
      gpsTrackingRef.current = false;
      locationService.stopTracking();
      setGpsActive(false);
      return;
    }
    gpsTrackingRef.current = true;
    locationSelectionGenerationRef.current += 1;
    lastCityGeocodeRef.current = null;
    setLocationError(null);
    setLocationSource('gps');
    manualCitySelectedRef.current = false;
    gpsCityAvailableRef.current = false;
    setSelectedCity('');
    setSelectedState(null);
    setSelectedLocality(null);
    try {
      localStorage.removeItem('chatmaps_selected_city');
      localStorage.removeItem('chatmaps_location_source');
    } catch {}
    locationService.startTracking();
  }, [isDetectingLocation]);

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('chatmaps_notifs', JSON.stringify(updated));
    } catch {}
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        selectedCity,
        setSelectedCity: handleSetCity,
        selectedState,
        selectedLocality,
        locationSource,
        locationError,
        customerCoordinates,
        isDetectingLocation,
        detectCurrentLocation,
        clearSelectedCity,
        gpsActive,
        toggleGps,
        notifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
