import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  Activity,
  Heart,
  Info,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  RotateCcw,
  Footprints,
  Play,
  Pause,
  Square,
  Navigation,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Edit2,
  Check,
  X,
  MapPin,
  Compass
} from 'lucide-react';
import {
  calorieService,
  DailyActivitySummary,
  FoodDiaryEntry,
  WalkingSession,
  MealCategory
} from '../services/calorieService';
import {
  STREET_FOOD_CALORIES,
  StreetFoodCalorieItem
} from '../data/streetFoodCalories';
import { locationService, LocationState } from '../services/locationService';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Calories: React.FC = () => {
  const { t } = useApp();
  const { userProfile, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DailyActivitySummary>(() => calorieService.getTodaySummary());
  const [walkingSession, setWalkingSession] = useState<WalkingSession | null>(() => calorieService.getActiveWalkingSession());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'diary' | 'tracker' | 'summary'>('diary');
  
  // Food adding modal / drawer state
  const [selectedFoodForAdd, setSelectedFoodForAdd] = useState<StreetFoodCalorieItem | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>('Snacks');
  const [servingMultiplier, setServingMultiplier] = useState<number>(1.0);
  const [servingLabel, setServingLabel] = useState<string>('1 Plate');

  // Editing existing entry state
  const [editingEntry, setEditingEntry] = useState<FoodDiaryEntry | null>(null);
  const [editMeal, setEditMeal] = useState<MealCategory>('Snacks');
  const [editMultiplier, setEditMultiplier] = useState<number>(1.0);
  const [editLabel, setEditLabel] = useState<string>('1 Plate');

  // Daily goal budget edit
  const [isGoalEditing, setIsGoalEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(summary.dailyCalorieBudget.toString());
  const [notification, setNotification] = useState<string | null>(null);

  // GPS state for walking
  const [gpsLocation, setGpsLocation] = useState<LocationState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Categories for street food
  const categories = ['All', 'Chaat', 'South Indian', 'Indo-Chinese', 'Snacks', 'Beverage', 'Dessert'];

  useEffect(() => {
    // Subscribe to diary changes
    const unsubDiary = calorieService.subscribeDailySummary((sum) => {
      setSummary(sum);
    });

    // Subscribe to active walking session
    const unsubWalk = calorieService.subscribeWalkingSession((sess) => {
      setWalkingSession(sess);
    });

    // Subscribe to GPS location updates
    const unsubGps = locationService.subscribe((loc) => {
      setGpsLocation(loc);
      if (loc.coords && walkingSession?.isActive && !walkingSession.isPaused) {
        calorieService.addWalkingBreadcrumb(loc.coords);
      }
    });

    // Pull from Firestore if logged in
    calorieService.fetchAndMergeFromFirestore();

    return () => {
      unsubDiary();
      unsubWalk();
      unsubGps();
    };
  }, [walkingSession?.isActive, walkingSession?.isPaused]);

  useEffect(() => {
    if (authLoading) return;
    setSummary(calorieService.getTodaySummary());
    setWalkingSession(calorieService.getActiveWalkingSession());
    void calorieService.fetchAndMergeFromFirestore().then(() => setSummary(calorieService.getTodaySummary()));
  }, [authLoading, userProfile?.uid]);

  // Draw walking breadcrumb route on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !walkingSession || walkingSession.route.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const route = walkingSession.route;
    if (route.length === 1) {
      // Single starting point
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 8, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    // Find bounding box of GPS coordinates
    let minLat = route[0].lat;
    let maxLat = route[0].lat;
    let minLng = route[0].lng;
    let maxLng = route[0].lng;

    route.forEach((pt) => {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lng < minLng) minLng = pt.lng;
      if (pt.lng > maxLng) maxLng = pt.lng;
    });

    const latSpan = Math.max(0.0002, maxLat - minLat);
    const lngSpan = Math.max(0.0002, maxLng - minLng);
    const pad = 24;

    const getX = (lng: number) => pad + ((lng - minLng) / lngSpan) * (width - 2 * pad);
    const getY = (lat: number) => height - (pad + ((lat - minLat) / latSpan) * (height - 2 * pad));

    // Draw route path
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    route.forEach((pt, i) => {
      const x = getX(pt.lng);
      const y = getY(pt.lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Start point (Green dot)
    const startX = getX(route[0].lng);
    const startY = getY(route[0].lat);
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current point (Pulsating Orange dot)
    const last = route[route.length - 1];
    const currX = getX(last.lng);
    const currY = getY(last.lat);
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(currX, currY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }, [walkingSession?.route]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleOpenAddModal = (food: StreetFoodCalorieItem) => {
    setSelectedFoodForAdd(food);
    setServingMultiplier(1.0);
    setServingLabel('1 Plate');
    // Determine default meal based on time of day
    const hour = new Date().getHours();
    if (hour < 11) setSelectedMeal('Breakfast');
    else if (hour < 16) setSelectedMeal('Lunch');
    else if (hour < 19) setSelectedMeal('Snacks');
    else setSelectedMeal('Dinner');
  };

  const handleConfirmAddFood = () => {
    if (!selectedFoodForAdd) return;
    const entry = calorieService.addFoodEntry(
      selectedFoodForAdd,
      selectedMeal,
      servingMultiplier,
      servingLabel
    );
    showToast(`Added ${entry.name} (${entry.calories} kcal) to ${selectedMeal}`);
    setSelectedFoodForAdd(null);
  };

  const handleOpenEditModal = (entry: FoodDiaryEntry) => {
    setEditingEntry(entry);
    setEditMeal(entry.meal);
    setEditMultiplier(entry.servingMultiplier);
    setEditLabel(entry.servingLabel);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    calorieService.updateFoodEntry(editingEntry.id, {
      meal: editMeal,
      servingMultiplier: editMultiplier,
      servingLabel: editLabel
    });
    showToast(`Updated ${editingEntry.name}`);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string, name: string) => {
    calorieService.deleteFoodEntry(entryId);
    showToast(`Removed ${name}`);
  };

  const handleClearAll = () => {
    if (window.confirm('Reset all logged street foods and walking sessions for today?')) {
      calorieService.clearToday();
      showToast("Today's activity diary reset");
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val >= 500 && val <= 6000) {
      calorieService.setDailyBudget(val);
      setIsGoalEditing(false);
      showToast(`Daily budget set to ${val} kcal`);
    }
  };

  // Walking Controls
  const handleStartWalk = async () => {
    try {
      const loc = await locationService.getCurrentPosition(true);
      if (!loc.coords || !Number.isFinite(loc.coords.lat) || !Number.isFinite(loc.coords.lng)) {
        throw new Error('A valid GPS fix was not returned.');
      }
      locationService.startTracking();
      calorieService.startWalking(loc.coords || undefined, userProfile?.weightKg);
      showToast('Walking tracker started with High Accuracy GPS!');
    } catch {
      showToast('GPS location is unavailable. Allow location access and try starting the walk again.');
    }
  };

  const handlePauseWalk = () => {
    calorieService.pauseWalking();
    showToast('Walking paused');
  };

  const handleResumeWalk = () => {
    locationService.startTracking();
    calorieService.resumeWalking();
    showToast('Walking resumed. GPS will update when the device provides a fix.');
  };

  const handleStopWalk = () => {
    const session = calorieService.stopWalking();
    locationService.stopTracking();
    if (session) {
      showToast(`Walk finished! +${session.caloriesBurned} kcal burned (${session.distanceKm} km, ${session.steps} steps)`);
    } else {
      showToast('Walk session ended');
    }
  };

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredFoods = STREET_FOOD_CALORIES.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const progressPercent = Math.min(
    100,
    Math.round((summary.totalCaloriesConsumed / summary.dailyCalorieBudget) * 100)
  );

  return (
    <div className="flex-1 w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-full shadow-2xl border border-orange-500/50 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header Card with Gradient */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-4 md:px-8 py-6 md:py-8 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider">
                Street Food Health Meter
              </span>
              <span className="flex items-center gap-1 text-[11px] bg-black/20 px-2 py-0.5 rounded-full font-semibold">
                <Footprints className="w-3 h-3 text-amber-300" />
                <span>Live Sync</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-1">
              Calories & Walking Tracker
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl">
              Track food intake and GPS-measured walks; food nutrition and exercise output are estimates.
            </p>
          </div>

          {/* Quick Clear Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition active:scale-95 flex items-center gap-1.5"
              title="Reset day"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Day</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-5 space-y-6">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Nutrition values are approximate estimates for the listed serving; recipes and portions vary. Exercise calories and GPS-derived steps are estimates. Exercise is shown separately and does not reduce your food goal.</p>
        {/* ========================================================
            1. DAILY SUMMARY METRICS (Responsive Cards on Phone & Tablet)
            ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {/* Calorie Intake */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Consumed</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-black text-stone-900 dark:text-stone-100">
                {summary.totalCaloriesConsumed}
              </span>
              <span className="text-[11px] text-stone-400 font-bold ml-1">kcal</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium mt-1">
              Budget: {summary.dailyCalorieBudget} kcal
            </div>
          </div>

          {/* Calories Burned via Walking */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Burned</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.totalCaloriesBurned}
              </span>
              <span className="text-[11px] text-stone-400 font-bold ml-1">kcal</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium mt-1">
              {summary.totalWalkingMinutes} mins walked
            </div>
          </div>

          {/* Distance & Steps */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Walking</span>
              <Footprints className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
                {summary.totalWalkingDistanceKm}
              </span>
              <span className="text-[11px] text-stone-400 font-bold ml-1">km</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium mt-1">
              {summary.totalSteps.toLocaleString()} estimated steps
            </div>
          </div>

          {/* Remaining Calorie Budget */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Remaining</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
                {summary.remainingCalories}
              </span>
              <span className="text-[11px] text-stone-400 font-bold ml-1">kcal</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium mt-1">
              Food intake: {summary.netCalories} kcal
            </div>
          </div>
        </div>

        {/* Progress Bar & Goal Quick Adjust */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-stone-700 dark:text-stone-300">Daily Calorie Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">{progressPercent}%</span>
              <button
                onClick={() => setIsGoalEditing(!isGoalEditing)}
                className="text-[11px] text-stone-400 hover:text-orange-600 font-semibold underline"
              >
                {isGoalEditing ? 'Cancel' : 'Edit Target'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent > 100
                  ? 'bg-rose-500'
                  : progressPercent > 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>

          {/* Goal Edit Form */}
          {isGoalEditing && (
            <form onSubmit={handleSaveGoal} className="pt-2 flex items-center gap-2">
              <span className="text-xs text-stone-500">Daily Target:</span>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min="500"
                max="6000"
                className="w-24 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent text-xs font-bold outline-none"
              />
              <span className="text-xs text-stone-500">kcal</span>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* ========================================================
            2. WALKING TRACKER (Phone & Tablet Real-Time GPS Tracking)
            ======================================================== */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 md:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-stone-900 dark:text-stone-100">
                  Live Walking Tracker
                </h3>
                <p className="text-[11px] text-stone-400">
                  GPS-measured distance · estimated steps and calories
                </p>
              </div>
            </div>

            {/* GPS Signal Status Badge */}
            {gpsLocation && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                <span
                  className={`w-2 h-2 rounded-full ${
                    gpsLocation.accuracyLevel === 'excellent'
                      ? 'bg-emerald-500 animate-pulse'
                      : gpsLocation.accuracyLevel === 'good'
                      ? 'bg-teal-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span>{gpsLocation.accuracyDescription}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-stone-500">This website cannot read your phone’s native step counter. Step count is estimated from GPS distance; calorie burn is an estimate using walking speed and {userProfile?.weightKg ? 'your saved weight' : 'an assumed 70 kg body weight'}.</p>

          {/* Active Walk Dashboard Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Duration</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                {walkingSession ? formatSeconds(walkingSession.durationSeconds) : '00:00'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Distance</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">
                {walkingSession ? walkingSession.distanceKm.toFixed(2) : '0.00'}
                <span className="text-xs text-stone-400 ml-0.5">km</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Est. steps</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                {walkingSession ? walkingSession.steps.toLocaleString() : '0'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Burned</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {walkingSession ? walkingSession.caloriesBurned : '0'}
                <span className="text-xs text-stone-400 ml-0.5">kcal</span>
              </span>
            </div>
          </div>

          {/* Interactive Route Canvas Visualizer (shows route breadcrumbs while tracking) */}
          {walkingSession && walkingSession.route.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 p-2">
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold text-stone-500">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-orange-600" />
                  <span>GPS Route Path ({walkingSession.route.length} waypoints)</span>
                </span>
                <span className="text-emerald-600">● GPS updates</span>
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={160}
                className="w-full h-36 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800"
              />
            </div>
          )}

          {/* Action Buttons: Start / Pause / Resume / Stop */}
          <div className="flex items-center gap-2 pt-1">
            {!walkingSession || !walkingSession.isActive ? (
              <button
                onClick={handleStartWalk}
                className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Walking Tracker</span>
              </button>
            ) : (
              <>
                {walkingSession.isPaused ? (
                  <button
                    onClick={handleResumeWalk}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume Walk</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseWalk}
                    className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Walk</span>
                  </button>
                )}

                <button
                  onClick={handleStopWalk}
                  className="py-3 px-5 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-rose-600 text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finish & Save</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========================================================
            3. FOOD DIARY: MEALS BREAKDOWN (Breakfast, Lunch, Dinner, Snacks)
            ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm md:text-base text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>Today's Food Diary</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">
              {summary.totalCaloriesConsumed} kcal total
            </span>
          </div>

          {/* 4 Meal Cards (Breakfast, Lunch, Dinner, Snacks) */}
          {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealCategory[]).map((mealName) => {
            const mealKey = mealName.toLowerCase() as keyof typeof summary.meals;
            const entries = summary.meals[mealKey] || [];
            const mealTotal = entries.reduce((s, e) => s + e.calories, 0);

            const MealIcon =
              mealName === 'Breakfast' ? Coffee :
              mealName === 'Lunch' ? Sun :
              mealName === 'Dinner' ? Moon : Cookie;

            return (
              <div
                key={mealName}
                className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <MealIcon className="w-4 h-4 text-orange-500" />
                    <h4 className="font-extrabold text-xs md:text-sm text-stone-900 dark:text-stone-100">
                      {mealName}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium">
                      ({entries.length} items)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {mealTotal} kcal
                  </span>
                </div>

                {/* Logged Entries in this meal */}
                {entries.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic py-1">
                    No items logged for {mealName.toLowerCase()} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 hover:bg-orange-50/50 dark:hover:bg-stone-800 transition text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-2">
                              <span className="font-semibold text-orange-600">{item.servingLabel}</span>
                              <span>•</span>
                              <span>P: {item.protein}g</span>
                              <span>•</span>
                              <span>C: {item.carbs}g</span>
                              <span>•</span>
                              <span>F: {item.fat}g</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-black text-stone-900 dark:text-stone-100">
                              +{item.calories}
                            </span>
                            <span className="text-[10px] text-stone-400 block font-medium">
                              {item.timeFormatted}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-stone-400 hover:text-orange-600 transition"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteEntry(item.id, item.name)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================
            4. FOOD SEARCH & DATABASE: ADD NEW FOODS
            ======================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm md:text-base text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Search & Add Street Foods
            </h3>
            <span className="text-xs text-stone-400 font-medium">
              {filteredFoods.length} items available
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs px-3.5 py-2.5">
            <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search street food (e.g. Pani Puri, Dosa, Gobi Manchurian)..."
              className="w-full text-xs sm:text-sm font-medium outline-none bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-orange-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Street Food Cards Grid (2 cols on phone, 3 cols on tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-3 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-orange-300 transition flex flex-col justify-between group"
              >
                <div className="flex gap-3">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 truncate group-hover:text-orange-600 transition-colors">
                      {food.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 truncate">{food.portion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-xs text-orange-600">
                        {food.calories} kcal
                      </span>
                      <span className="text-[10px] text-stone-400">
                        (~{food.burnMinutes}m walk)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="text-[10px] text-stone-400 flex items-center gap-1.5 font-medium">
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(food)}
                    className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 hover:bg-orange-600 hover:text-white font-bold text-xs transition active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Food</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD FOOD WITH SERVING SIZE & MEAL SELECTION
          ======================================================== */}
      {selectedFoodForAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedFoodForAdd.image}
                  alt={selectedFoodForAdd.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-sm">{selectedFoodForAdd.name}</h3>
                  <span className="text-[11px] text-orange-600 font-bold">
                    {Math.round(selectedFoodForAdd.calories * servingMultiplier)} kcal total
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFoodForAdd(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Category Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                Select Meal
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealCategory[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMeal(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      selectedMeal === m
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Serving Size Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                Serving Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '0.5x Half', mult: 0.5, name: '1/2 Plate' },
                  { label: '1.0x Full', mult: 1.0, name: '1 Plate' },
                  { label: '1.5x Large', mult: 1.5, name: '1.5 Plates' },
                  { label: '2.0x Double', mult: 2.0, name: '2 Plates' }
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setServingMultiplier(s.mult);
                      setServingLabel(s.name);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      servingMultiplier === s.mult
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutritional Breakdown Summary */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 text-center grid grid-cols-4 gap-1 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 block">Calories</span>
                <span className="font-extrabold text-orange-600">
                  {Math.round(selectedFoodForAdd.calories * servingMultiplier)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Carbs</span>
                <span className="font-bold">
                  {Math.round(selectedFoodForAdd.carbs * servingMultiplier)}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Protein</span>
                <span className="font-bold">
                  {Math.round(selectedFoodForAdd.protein * servingMultiplier)}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Fat</span>
                <span className="font-bold">
                  {Math.round(selectedFoodForAdd.fat * servingMultiplier)}g
                </span>
              </div>
            </div>

            {/* Confirm Add Button */}
            <button
              onClick={handleConfirmAddFood}
              className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Log to {selectedMeal}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT EXISTING ENTRY
          ======================================================== */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-extrabold text-sm">Edit Entry: {editingEntry.name}</h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Category */}
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                Meal Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealCategory[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEditMeal(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      editMeal === m
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Serving Size Multiplier */}
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                Serving Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '0.5x Half', mult: 0.5, name: '1/2 Plate' },
                  { label: '1.0x Full', mult: 1.0, name: '1 Plate' },
                  { label: '1.5x Large', mult: 1.5, name: '1.5 Plates' },
                  { label: '2.0x Double', mult: 2.0, name: '2 Plates' }
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setEditMultiplier(s.mult);
                      setEditLabel(s.name);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      editMultiplier === s.mult
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-1 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
