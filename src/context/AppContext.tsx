import React, { createContext, useContext, useEffect, useState } from 'react';
import { locationService } from '../services/locationService';

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
      return localStorage.getItem('chatmaps_selected_city') || 'Select a city';
    } catch {}
    return 'Select a city';
  });

  const [gpsActive, setGpsActive] = useState<boolean>(false);
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

  // Set city
  const handleSetCity = (city: string) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('chatmaps_selected_city', city);
    } catch {}
  };

  useEffect(() => locationService.subscribe((location) => {
    setGpsActive(location.status === 'tracking' && location.coords !== null);
  }), []);

  const toggleGps = () => {
    if (gpsActive) {
      locationService.stopTracking();
      setGpsActive(false);
      return;
    }
    locationService.startTracking();
  };

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
