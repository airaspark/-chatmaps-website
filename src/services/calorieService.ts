/**
 * ChatMaps Calorie Diary & Walking Tracker Service
 * 
 * Provides:
 * - Street Food Diary with Meal Categorization (Breakfast, Lunch, Dinner, Snacks)
 * - Serving Size Selection (0.5x, 1x, 1.5x, 2x, custom portions)
 * - Walking Tracker with real-time GPS distance, duration, steps & calories burned
 * - Daily Summary calculation (consumed, burned, remaining budget)
 * - Dual persistence: Cloud Firestore (for cross-device phone/tablet sync) + LocalStorage offline fallback
 */

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { StreetFoodCalorieItem, STREET_FOOD_CALORIES } from '../data/streetFoodCalories';

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface FoodDiaryEntry {
  id: string;
  foodId: string;
  name: string;
  kannadaName?: string;
  meal: MealCategory;
  servingMultiplier: number; // e.g. 1.0, 0.5, 1.5, 2.0
  servingLabel: string; // e.g. "1 Plate", "1/2 Plate", "2 Plates"
  portionDescription: string;
  calories: number; // in kcal
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  burnMinutes: number; // estimated walking time to burn off
  image: string;
  timestamp: number;
  timeFormatted: string; // e.g. "12:45 PM"
}

export interface WalkingRoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface WalkingSession {
  id: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  distanceKm: number;
  steps: number;
  stepSource?: 'gps-estimate' | 'device';
  calorieEstimate?: boolean;
  weightKgUsed?: number;
  caloriesBurned: number;
  route: WalkingRoutePoint[];
  isActive: boolean;
  isPaused: boolean;
}

export interface DailyActivitySummary {
  dateKey: string; // YYYY-MM-DD
  dailyCalorieBudget: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;
  totalWalkingDistanceKm: number;
  totalSteps: number;
  totalWalkingMinutes: number;
  meals: {
    breakfast: FoodDiaryEntry[];
    lunch: FoodDiaryEntry[];
    dinner: FoodDiaryEntry[];
    snacks: FoodDiaryEntry[];
  };
  walkingSessions: WalkingSession[];
}

const STORAGE_DIARY_PREFIX = 'chatmaps_diary_';
const STORAGE_BUDGET_KEY = 'chatmaps_daily_budget';
const STORAGE_WALKING_KEY = 'chatmaps_active_walking';

const userStorageSuffix = () => auth?.currentUser?.uid ? `user_${auth.currentUser.uid}_` : '';
const diaryStorageKey = (dateKey: string) => `${STORAGE_DIARY_PREFIX}${userStorageSuffix()}${dateKey}`;
const budgetStorageKey = () => `${userStorageSuffix()}${STORAGE_BUDGET_KEY}`;
const walkingStorageKey = (uid: string | null = auth?.currentUser?.uid || null) => `${uid ? `user_${uid}_` : ''}${STORAGE_WALKING_KEY}`;

class CalorieService {
  private activeWalkInterval: any = null;
  private activeWalkSession: WalkingSession | null = null;
  private activeWalkUserUid: string | null = null;
  private walkListeners: Set<(session: WalkingSession | null) => void> = new Set();
  private diaryListeners: Set<(summary: DailyActivitySummary) => void> = new Set();

  public getTodayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public getDailyBudget(): number {
    try {
      const saved = localStorage.getItem(budgetStorageKey());
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 2000;
  }

  public setDailyBudget(budget: number): void {
    try {
      localStorage.setItem(budgetStorageKey(), budget.toString());
      this.syncSummaryToFirestore(this.getTodaySummary());
    } catch {}
  }

  /**
   * Load current day's summary from local storage or cloud
   */
  public getTodaySummary(): DailyActivitySummary {
    const today = this.getTodayKey();
    return this.getDaySummary(today);
  }

  public getDaySummary(dateKey: string): DailyActivitySummary {
    const defaultBudget = this.getDailyBudget();
    let entries: FoodDiaryEntry[] = [];
    let walkingSessions: WalkingSession[] = [];

    try {
      const saved = localStorage.getItem(diaryStorageKey(dateKey));
      if (saved) {
        const parsed = JSON.parse(saved);
        entries = parsed.entries || [];
        walkingSessions = parsed.walkingSessions || [];
      }
    } catch {}

    const meals = {
      breakfast: entries.filter((e) => e.meal === 'Breakfast'),
      lunch: entries.filter((e) => e.meal === 'Lunch'),
      dinner: entries.filter((e) => e.meal === 'Dinner'),
      snacks: entries.filter((e) => e.meal === 'Snacks')
    };

    const totalCaloriesConsumed = entries.reduce((acc, curr) => acc + curr.calories, 0);
    const totalCaloriesBurned = walkingSessions.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
    const totalWalkingDistanceKm = Number(
      walkingSessions.reduce((acc, curr) => acc + curr.distanceKm, 0).toFixed(2)
    );
    const totalSteps = walkingSessions.reduce((acc, curr) => acc + curr.steps, 0);
    const totalWalkingMinutes = Math.round(
      walkingSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60
    );

    // Food budget tracks intake only; exercise expenditure stays separate.
    const netCalories = totalCaloriesConsumed;
    const remainingCalories = Math.max(0, defaultBudget - netCalories);

    return {
      dateKey,
      dailyCalorieBudget: defaultBudget,
      totalCaloriesConsumed,
      totalCaloriesBurned,
      netCalories,
      remainingCalories,
      totalWalkingDistanceKm,
      totalSteps,
      totalWalkingMinutes,
      meals,
      walkingSessions
    };
  }

  /**
   * Add new food entry to the diary
   */
  public addFoodEntry(
    food: StreetFoodCalorieItem,
    meal: MealCategory = 'Snacks',
    servingMultiplier: number = 1.0,
    servingLabel: string = '1 Plate'
  ): FoodDiaryEntry {
    const now = new Date();
    const entry: FoodDiaryEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      foodId: food.id,
      name: food.name,
      kannadaName: food.kannadaName,
      meal,
      servingMultiplier,
      servingLabel,
      portionDescription: food.portion,
      calories: Math.round(food.calories * servingMultiplier),
      carbs: Math.round(food.carbs * servingMultiplier),
      protein: Math.round(food.protein * servingMultiplier),
      fat: Math.round(food.fat * servingMultiplier),
      burnMinutes: Math.round(food.burnMinutes * servingMultiplier),
      image: food.image,
      timestamp: now.getTime(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const today = this.getTodayKey();
    const key = diaryStorageKey(today);
    let entries: FoodDiaryEntry[] = [];
    let walkingSessions: WalkingSession[] = [];

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        entries = parsed.entries || [];
        walkingSessions = parsed.walkingSessions || [];
      }
    } catch {}

    entries.unshift(entry);
    this.saveData(today, entries, walkingSessions);
    return entry;
  }

  /**
   * Update an existing food diary entry (e.g., changed meal category or portion size)
   */
  public updateFoodEntry(
    entryId: string,
    updates: Partial<Pick<FoodDiaryEntry, 'meal' | 'servingMultiplier' | 'servingLabel'>>
  ): void {
    const today = this.getTodayKey();
    const key = diaryStorageKey(today);

    try {
      const saved = localStorage.getItem(key);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const entries: FoodDiaryEntry[] = parsed.entries || [];
      const walkingSessions: WalkingSession[] = parsed.walkingSessions || [];

      const targetIdx = entries.findIndex((e) => e.id === entryId);
      if (targetIdx !== -1) {
        const original = entries[targetIdx];
        const baseFood = STREET_FOOD_CALORIES.find((f) => f.id === original.foodId);
        const newMultiplier = updates.servingMultiplier ?? original.servingMultiplier;

        const baseCalories = baseFood ? baseFood.calories : original.calories / original.servingMultiplier;
        const baseCarbs = baseFood ? baseFood.carbs : original.carbs / original.servingMultiplier;
        const baseProtein = baseFood ? baseFood.protein : original.protein / original.servingMultiplier;
        const baseFat = baseFood ? baseFood.fat : original.fat / original.servingMultiplier;
        const baseBurn = baseFood ? baseFood.burnMinutes : original.burnMinutes / original.servingMultiplier;

        entries[targetIdx] = {
          ...original,
          meal: updates.meal ?? original.meal,
          servingMultiplier: newMultiplier,
          servingLabel: updates.servingLabel ?? original.servingLabel,
          calories: Math.round(baseCalories * newMultiplier),
          carbs: Math.round(baseCarbs * newMultiplier),
          protein: Math.round(baseProtein * newMultiplier),
          fat: Math.round(baseFat * newMultiplier),
          burnMinutes: Math.round(baseBurn * newMultiplier)
        };

        this.saveData(today, entries, walkingSessions);
      }
    } catch {}
  }

  /**
   * Remove entry from today's food diary
   */
  public deleteFoodEntry(entryId: string): void {
    const today = this.getTodayKey();
    const key = diaryStorageKey(today);

    try {
      const saved = localStorage.getItem(key);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const entries: FoodDiaryEntry[] = (parsed.entries || []).filter((e: FoodDiaryEntry) => e.id !== entryId);
      const walkingSessions: WalkingSession[] = parsed.walkingSessions || [];
      this.saveData(today, entries, walkingSessions);
    } catch {}
  }

  /**
   * Clear today's diary
   */
  public clearToday(): void {
    const today = this.getTodayKey();
    this.saveData(today, [], []);
  }

  // ==========================================
  // WALKING TRACKER IMPLEMENTATION
  // ==========================================

  public getActiveWalkingSession(): WalkingSession | null {
    const currentUid = auth?.currentUser?.uid || null;
    if (this.activeWalkSession && this.activeWalkUserUid !== currentUid) {
      this.stopWalkingTimer();
      this.activeWalkSession = null;
    }
    this.activeWalkUserUid = currentUid;
    if (this.activeWalkSession) return this.activeWalkSession;
    try {
      const saved = localStorage.getItem(walkingStorageKey(currentUid));
      if (saved) {
        this.activeWalkSession = JSON.parse(saved);
        if (this.activeWalkSession?.isActive && !this.activeWalkSession.isPaused) {
          this.activeWalkSession.isPaused = true;
          this.saveActiveWalkToStorage();
        }
        return this.activeWalkSession;
      }
    } catch {}
    return null;
  }

  public subscribeWalkingSession(listener: (session: WalkingSession | null) => void): () => void {
    this.walkListeners.add(listener);
    listener(this.getActiveWalkingSession());
    return () => {
      this.walkListeners.delete(listener);
    };
  }

  public subscribeDailySummary(listener: (summary: DailyActivitySummary) => void): () => void {
    this.diaryListeners.add(listener);
    listener(this.getTodaySummary());
    return () => {
      this.diaryListeners.delete(listener);
    };
  }

  private notifyWalk() {
    this.walkListeners.forEach((cb) => cb(this.activeWalkSession));
  }

  private notifyDiary() {
    const summary = this.getTodaySummary();
    this.diaryListeners.forEach((cb) => cb(summary));
  }

  /**
   * Start a new walking session
   */
  public startWalking(initialCoords?: { lat: number; lng: number }, weightKg?: number): WalkingSession {
    this.getActiveWalkingSession();
    if (this.activeWalkSession && this.activeWalkSession.isActive) {
      if (this.activeWalkSession.isPaused) {
        this.resumeWalking();
      }
      return this.activeWalkSession;
    }

    const initialRoute: WalkingRoutePoint[] = initialCoords
      ? [{ lat: initialCoords.lat, lng: initialCoords.lng, timestamp: Date.now() }]
      : [];

    const newSession: WalkingSession = {
      id: 'walk_' + Date.now(),
      startTime: Date.now(),
      durationSeconds: 0,
      distanceKm: 0,
      steps: 0,
      stepSource: 'gps-estimate',
      calorieEstimate: true,
      weightKgUsed: Number.isFinite(weightKg) && (weightKg as number) > 0 ? weightKg : 70,
      caloriesBurned: 0,
      route: initialRoute,
      isActive: true,
      isPaused: false
    };

    this.activeWalkSession = newSession;
    this.activeWalkUserUid = auth?.currentUser?.uid || null;
    this.saveActiveWalkToStorage();
    this.startWalkingTimer();
    this.notifyWalk();
    return newSession;
  }

  public pauseWalking(): void {
    if (!this.activeWalkSession || !this.activeWalkSession.isActive) return;
    this.activeWalkSession.isPaused = true;
    this.stopWalkingTimer();
    this.saveActiveWalkToStorage();
    this.notifyWalk();
  }

  public resumeWalking(): void {
    if (!this.activeWalkSession || !this.activeWalkSession.isActive) return;
    this.activeWalkSession.isPaused = false;
    this.startWalkingTimer();
    this.saveActiveWalkToStorage();
    this.notifyWalk();
  }

  /**
   * Record a new GPS waypoint while walking
   */
  public addWalkingBreadcrumb(coords: { lat: number; lng: number }): void {
    if (!this.activeWalkSession || !this.activeWalkSession.isActive || this.activeWalkSession.isPaused) {
      return;
    }

    const route = this.activeWalkSession.route;
    const now = Date.now();

    if (route.length > 0) {
      const lastPoint = route[route.length - 1];
      const distMeters = this.calculateDistanceMeters(
        lastPoint.lat,
        lastPoint.lng,
        coords.lat,
        coords.lng
      );

      // Filter out GPS jitter (< 2.5m) and extreme teleportation jumps (> 200m in a few seconds)
      if (distMeters >= 2.5 && distMeters < 250) {
        const addedKm = distMeters / 1000;
        const newDist = Number((this.activeWalkSession.distanceKm + addedKm).toFixed(3));
        
        // GPS distance can only produce an estimate, not a device-recorded step count.
        const addedSteps = Math.round(distMeters / 0.76);
        const newSteps = this.activeWalkSession.steps + addedSteps;

        const newCalories = this.estimateWalkingCalories(newDist, this.activeWalkSession.durationSeconds, this.activeWalkSession.weightKgUsed || 70);

        this.activeWalkSession.distanceKm = newDist;
        this.activeWalkSession.steps = newSteps;
        this.activeWalkSession.caloriesBurned = newCalories;
        this.activeWalkSession.route.push({ lat: coords.lat, lng: coords.lng, timestamp: now });

        this.saveActiveWalkToStorage();
        this.notifyWalk();
      }
    } else {
      this.activeWalkSession.route.push({ lat: coords.lat, lng: coords.lng, timestamp: now });
      this.saveActiveWalkToStorage();
      this.notifyWalk();
    }
  }

  /**
   * Finish and save walking session
   */
  public stopWalking(): WalkingSession | null {
    this.getActiveWalkingSession();
    if (!this.activeWalkSession) return null;

    this.stopWalkingTimer();
    const completedSession: WalkingSession = {
      ...this.activeWalkSession,
      endTime: Date.now(),
      isActive: false,
      isPaused: false
    };

    // Save to today's history if distance > 0.02 km or duration > 15s
    if (completedSession.distanceKm >= 0.02 || completedSession.durationSeconds >= 15) {
      const today = this.getTodayKey();
      const key = diaryStorageKey(today);
      let entries: FoodDiaryEntry[] = [];
      let walkingSessions: WalkingSession[] = [];

      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          entries = parsed.entries || [];
          walkingSessions = parsed.walkingSessions || [];
        }
      } catch {}

      walkingSessions.unshift(completedSession);
      this.saveData(today, entries, walkingSessions);
    }

    this.activeWalkSession = null;
    try {
      localStorage.removeItem(walkingStorageKey(this.activeWalkUserUid));
    } catch {}
    this.activeWalkUserUid = auth?.currentUser?.uid || null;

    this.notifyWalk();
    return completedSession;
  }

  private startWalkingTimer() {
    this.stopWalkingTimer();
    this.activeWalkInterval = setInterval(() => {
      if (this.activeWalkUserUid !== (auth?.currentUser?.uid || null)) {
        this.activeWalkSession = null;
        this.activeWalkUserUid = auth?.currentUser?.uid || null;
        this.stopWalkingTimer();
        this.notifyWalk();
        return;
      }
      if (this.activeWalkSession && this.activeWalkSession.isActive && !this.activeWalkSession.isPaused) {
        this.activeWalkSession.durationSeconds += 1;
        // Update an estimate from measured distance and elapsed session time; no distance means no burn estimate.
        if (this.activeWalkSession.durationSeconds % 30 === 0) {
          this.activeWalkSession.caloriesBurned = this.estimateWalkingCalories(
            this.activeWalkSession.distanceKm,
            this.activeWalkSession.durationSeconds,
            this.activeWalkSession.weightKgUsed || 70
          );
          this.saveActiveWalkToStorage();
        }
        this.notifyWalk();
      }
    }, 1000);
  }

  private stopWalkingTimer() {
    if (this.activeWalkInterval) {
      clearInterval(this.activeWalkInterval);
      this.activeWalkInterval = null;
    }
  }

  private estimateWalkingCalories(distanceKm: number, durationSeconds: number, weightKg: number): number {
    if (distanceKm <= 0 || durationSeconds <= 0) return 0;
    const hours = durationSeconds / 3600;
    const speedKmh = distanceKm / hours;
    const met = speedKmh < 3.2 ? 2.8 : speedKmh < 5.6 ? 3.5 : 5;
    return Math.max(0, Math.round(met * weightKg * hours));
  }

  private saveActiveWalkToStorage() {
    if (!this.activeWalkSession) return;
    if (this.activeWalkUserUid !== (auth?.currentUser?.uid || null)) return;
    try {
      localStorage.setItem(walkingStorageKey(this.activeWalkUserUid), JSON.stringify(this.activeWalkSession));
    } catch {}
  }

  private saveData(dateKey: string, entries: FoodDiaryEntry[], walkingSessions: WalkingSession[]) {
    try {
      const payload = { entries, walkingSessions };
      localStorage.setItem(diaryStorageKey(dateKey), JSON.stringify(payload));
      this.notifyDiary();
      this.syncSummaryToFirestore(this.getDaySummary(dateKey));
    } catch {}
  }

  /**
   * Sync user's daily activity data to Firestore (cross-device sync across phone & tablet)
   */
  public async syncSummaryToFirestore(summary: DailyActivitySummary): Promise<void> {
    try {
      if (!auth || !db || !auth.currentUser) return;
      const user = auth.currentUser;

      const userDocRef = doc(db, 'users', user.uid, 'calorieData', summary.dateKey);
      await setDoc(
        userDocRef,
        {
          dateKey: summary.dateKey,
          dailyCalorieBudget: summary.dailyCalorieBudget,
          totalCaloriesConsumed: summary.totalCaloriesConsumed,
          totalCaloriesBurned: summary.totalCaloriesBurned,
          netCalories: summary.netCalories,
          remainingCalories: summary.remainingCalories,
          totalWalkingDistanceKm: summary.totalWalkingDistanceKm,
          totalSteps: summary.totalSteps,
          totalWalkingMinutes: summary.totalWalkingMinutes,
          meals: summary.meals,
          walkingSessions: summary.walkingSessions,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.debug('Firestore sync skipped or offline:', err);
    }
  }

  /**
   * Fetch from Firestore on initial login or mount
   */
  public async fetchAndMergeFromFirestore(dateKey: string = this.getTodayKey()): Promise<void> {
    try {
      if (!auth || !db || !auth.currentUser) return;
      const user = auth.currentUser;

      const userDocRef = doc(db, 'users', user.uid, 'calorieData', dateKey);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData) {
          const cloudEntries: FoodDiaryEntry[] = [
            ...(cloudData.meals?.breakfast || []),
            ...(cloudData.meals?.lunch || []),
            ...(cloudData.meals?.dinner || []),
            ...(cloudData.meals?.snacks || [])
          ];
          const cloudWalking: WalkingSession[] = cloudData.walkingSessions || [];
          
          // Merge with local storage
          const localSaved = localStorage.getItem(diaryStorageKey(dateKey));
          const localParsed = localSaved ? JSON.parse(localSaved) : { entries: [], walkingSessions: [] };

          const mergedEntriesMap = new Map<string, FoodDiaryEntry>();
          cloudEntries.forEach((e) => mergedEntriesMap.set(e.id, e));
          (localParsed.entries || []).forEach((e: FoodDiaryEntry) => mergedEntriesMap.set(e.id, e));

          const mergedWalkingMap = new Map<string, WalkingSession>();
          cloudWalking.forEach((w) => mergedWalkingMap.set(w.id, w));
          (localParsed.walkingSessions || []).forEach((w: WalkingSession) => mergedWalkingMap.set(w.id, w));

          const finalEntries = Array.from(mergedEntriesMap.values());
          const finalWalking = Array.from(mergedWalkingMap.values());

          this.saveData(dateKey, finalEntries, finalWalking);
        }
      }
    } catch (err) {
      console.debug('Failed to pull Firestore calorie data:', err);
    }
  }

  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const calorieService = new CalorieService();
