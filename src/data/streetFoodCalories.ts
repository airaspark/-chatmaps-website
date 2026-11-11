export interface StreetFoodCalorieItem {
  id: string;
  name: string;
  kannadaName: string;
  category: string;
  portion: string;
  calories: number; // in kcal
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  burnMinutes: number; // walking time in min
  healthScore: 'Healthy' | 'Moderate' | 'Indulgence';
  tags: string[];
  tips: string;
  image: string;
}

export interface LoggedCalorieEntry {
  id: string;
  foodId: string;
  name: string;
  portion: string;
  calories: number;
  time: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  burnMinutes?: number;
}

export const STREET_FOOD_CALORIES: StreetFoodCalorieItem[] = [
  {
    id: 'cal-1',
    name: 'Pani Puri / Golgappa (6 pcs)',
    kannadaName: 'ಪಾನಿ ಪುರಿ (೬ ತುಂಡು)',
    category: 'Chaat',
    portion: '6 pieces (approx. 150g)',
    calories: 180,
    carbs: 32,
    protein: 4,
    fat: 5,
    burnMinutes: 25,
    healthScore: 'Moderate',
    tags: ['Chaat', 'Light', 'Pani Puri'],
    tips: 'Use mint-tamarind water and sprouted moong filling for added dietary fiber and protein.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-2',
    name: 'Butter Masala Dosa',
    kannadaName: 'ಬೆಣ್ಣೆ ಮಸಾಲೆ ದೋಸೆ',
    category: 'South Indian',
    portion: '1 medium dosa with chutney & sambar',
    calories: 380,
    carbs: 48,
    protein: 7,
    fat: 18,
    burnMinutes: 50,
    healthScore: 'Indulgence',
    tags: ['Dosa', 'South Indian', 'Butter'],
    tips: 'Opt for plain roast or podi thatte idli if looking for lower saturated fat options.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-3',
    name: 'Gobi Manchurian (Dry)',
    kannadaName: 'ಗೋಬಿ ಮಂಚೂರಿಯನ್',
    category: 'Chinese & Fast Food',
    portion: '1 plate (approx. 200g)',
    calories: 290,
    carbs: 38,
    protein: 5,
    fat: 14,
    burnMinutes: 40,
    healthScore: 'Moderate',
    tags: ['Gobi', 'Chinese', 'Snack'],
    tips: 'Ask for dry tossed cauliflower with less cornstarch batter and fresh spring onions.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-4',
    name: 'Steamed Veg Momos (6 pcs)',
    kannadaName: 'ಸ್ಟೀಮ್ಡ್ ವೆಜ್ ಮೊಮೊಸ್',
    category: 'Momos & Tibetan',
    portion: '6 pieces with red chili chutney',
    calories: 210,
    carbs: 35,
    protein: 6,
    fat: 4,
    burnMinutes: 30,
    healthScore: 'Healthy',
    tags: ['Momos', 'Steamed', 'Light'],
    tips: 'Steamed momos are naturally low in fat compared to kurkure or deep-fried varieties.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-5',
    name: 'Mumbai Sev Puri (6 pcs)',
    kannadaName: 'ಸೇವ್ ಪುರಿ (೬ ತುಂಡು)',
    category: 'Chaat',
    portion: '1 plate (6 puris loaded with sev)',
    calories: 260,
    carbs: 36,
    protein: 5,
    fat: 11,
    burnMinutes: 35,
    healthScore: 'Moderate',
    tags: ['Chaat', 'Sev Puri', 'Mumbai'],
    tips: 'Loaded with potatoes and sev; enjoy with raw mango and lemon juice for digestive tang.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-6',
    name: 'Amul Butter Pav Bhaji',
    kannadaName: 'ಪಾವ್ ಬಾಜಿ',
    category: 'Pav Bhaji & Fast Food',
    portion: '1 plate bhaji + 2 butter pavs',
    calories: 520,
    carbs: 65,
    protein: 10,
    fat: 26,
    burnMinutes: 75,
    healthScore: 'Indulgence',
    tags: ['Pav Bhaji', 'Butter', 'Street Food'],
    tips: 'Bhaji has rich vegetable content (tomatoes, peas, capsicum). Ask for lightly buttered pav.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-7',
    name: 'Kulhad Ginger Masala Chai',
    kannadaName: 'ಮಸಾಲೆ ಚಹಾ',
    category: 'Beverages',
    portion: '1 clay cup (120 ml with milk & sugar)',
    calories: 95,
    carbs: 14,
    protein: 3,
    fat: 3,
    burnMinutes: 14,
    healthScore: 'Healthy',
    tags: ['Chai', 'Tea', 'Ginger'],
    tips: 'Ginger and cardamom provide digestion support. Can ask for half-sugar.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-8',
    name: 'Aloo Samosa (1 pc)',
    kannadaName: 'ಆಲೂ ಸಮೋಸಾ (೧)',
    category: 'Chaat & Snacks',
    portion: '1 medium fried samosa with chutney',
    calories: 250,
    carbs: 30,
    protein: 4,
    fat: 14,
    burnMinutes: 35,
    healthScore: 'Indulgence',
    tags: ['Samosa', 'Fried', 'Snacks'],
    tips: 'Pair with coriander mint green chutney rather than sweet tamarind syrup to control sugar.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-9',
    name: 'Ghee Podi Thatte Idli (2 pcs)',
    kannadaName: 'ತಟ್ಟೆ ಇಡ್ಲಿ (೨ ತುಂಡು)',
    category: 'South Indian',
    portion: '2 steamed idlis with podi & ghee',
    calories: 280,
    carbs: 45,
    protein: 8,
    fat: 7,
    burnMinutes: 38,
    healthScore: 'Healthy',
    tags: ['Idli', 'South Indian', 'Steamed'],
    tips: 'Fermented batter provides gut-friendly probiotic benefits and high complex carbohydrates.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cal-10',
    name: 'Mumbai Vada Pav',
    kannadaName: 'ವಡಾ ಪಾವ್',
    category: 'Pav Bhaji & Fast Food',
    portion: '1 batata vada in pav with garlic podi',
    calories: 310,
    carbs: 42,
    protein: 6,
    fat: 13,
    burnMinutes: 45,
    healthScore: 'Moderate',
    tags: ['Vada Pav', 'Mumbai', 'Snack'],
    tips: 'Enjoy as a midday energy booster. The garlic dry chutney adds anti-inflammatory herbs.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
  }
];

const CALORIE_STORAGE_KEY = 'chatmaps_logged_calories';
const CALORIE_GOAL_KEY = 'chatmaps_calorie_goal';

export const calorieService = {
  getDailyGoal: (): number => {
    try {
      const g = localStorage.getItem(CALORIE_GOAL_KEY);
      if (g) return parseInt(g, 10);
    } catch {}
    return 2000;
  },

  saveDailyGoal: (goal: number): void => {
    try {
      localStorage.setItem(CALORIE_GOAL_KEY, goal.toString());
    } catch {}
  },

  getTodayKey: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  getLoggedEntries: (): LoggedCalorieEntry[] => {
    try {
      const data = localStorage.getItem(CALORIE_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  getLogsForDate: (_dateKey?: string): LoggedCalorieEntry[] => {
    return calorieService.getLoggedEntries();
  },

  addEntry: (item: StreetFoodCalorieItem): LoggedCalorieEntry => {
    const entry: LoggedCalorieEntry = {
      id: 'log-' + Date.now(),
      foodId: item.id,
      name: item.name,
      portion: item.portion,
      calories: item.calories,
      carbs: item.carbs,
      protein: item.protein,
      fat: item.fat,
      burnMinutes: item.burnMinutes,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const current = calorieService.getLoggedEntries();
    const next = [entry, ...current];
    try {
      localStorage.setItem(CALORIE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('chatmaps_calories_updated', { detail: next }));
    } catch {}
    return entry;
  },

  addLog: (data: {
    foodId: string;
    name: string;
    portion: string;
    calories: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    burnWalkingMins?: number;
  }): LoggedCalorieEntry => {
    const entry: LoggedCalorieEntry = {
      id: 'log-' + Date.now(),
      foodId: data.foodId,
      name: data.name,
      portion: data.portion,
      calories: data.calories,
      carbs: data.carbs,
      protein: data.protein,
      fat: data.fat,
      burnMinutes: data.burnWalkingMins,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const current = calorieService.getLoggedEntries();
    const next = [entry, ...current];
    try {
      localStorage.setItem(CALORIE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('chatmaps_calories_updated', { detail: next }));
    } catch {}
    return entry;
  },

  removeLog: (id: string): void => {
    calorieService.removeEntry(id);
  },

  removeEntry: (id: string): void => {
    const current = calorieService.getLoggedEntries();
    const next = current.filter(e => e.id !== id);
    try {
      localStorage.setItem(CALORIE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('chatmaps_calories_updated', { detail: next }));
    } catch {}
  },

  clearTodayLogs: (): void => {
    calorieService.clearAll();
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(CALORIE_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('chatmaps_calories_updated', { detail: [] }));
    } catch {}
  }
};

