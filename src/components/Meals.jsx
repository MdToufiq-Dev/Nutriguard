import { useState, useEffect } from 'react';
import { useLoader } from '../contexts/LoaderContext';
import { useToast } from '../contexts/ToastContext';
import { useCurrentUser } from '../integration/useCurrentUser';
import * as planService from '../services/planService';
import { calculatePlanStats } from '../utils/planGenerator';
import { getMealsByType } from '../data/mealLibrary';
import { usePlan } from '../contexts/PlanContext';

const MEAL_ICONS = {
    breakfast: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="8"/><line x1="10" y1="2" x2="10" y2="8"/><line x1="14" y1="2" x2="14" y2="8"/></svg>,
    lunch: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/></svg>,
    dinner: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 4 3.57 6.46 4 9 4 12s-.43 5.54-1.27 8C5.58 18.03 7 16 7 13.33"/></svg>,
    snack: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/></svg>,
};

const CALORIE_ICON = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>;
const TIME_ICON = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function Meals() {
    const { triggerLoader } = useLoader();
    const { showToast } = useToast();
    const user = useCurrentUser();

    const [plan, setPlan] = useState(null);
    const [todayMeals, setTodayMeals] = useState([]);
    const [todayDayNumber, setTodayDayNumber] = useState(null);
    const [stats, setStats] = useState(null);

    // Use PlanContext instead of local useEffect for plan loading
    const { plan: contextPlan, loadPlan, swapMeal, clearPlan } = usePlan();
    useEffect(() => {
        if (contextPlan) {
            setPlan(contextPlan);
            const today = new Date().toISOString().split('T')[0];
            const todayDay = contextPlan.days.find(d => d.date === today);
            if (todayDay) {
                setTodayMeals(todayDay.meals);
                setTodayDayNumber(todayDay.dayNumber);
            } else {
                setTodayMeals([]);
                setTodayDayNumber(null);
            }
            setStats(calculatePlanStats(contextPlan));
        } else {
            setPlan(null);
            setTodayMeals([]);
            setTodayDayNumber(null);
            setStats(null);
        }
    }, [contextPlan]);

    const handleMealSwap = (mealId) => {
        triggerLoader(async () => {
            const currentMeal = todayMeals.find(m => m.id === mealId);
            if (!currentMeal || todayDayNumber === null) return;

            const alternatives = getMealsByType(currentMeal.mealType).filter(m => m.id !== mealId);
            if (alternatives.length === 0) {
                showToast('No alternative meals available', 'error');
                return;
            }

            const newMeal = alternatives[Math.floor(Math.random() * alternatives.length)];

            // Use context swapMeal which updates contextPlan
            const updated = await swapMeal(todayDayNumber, mealId, newMeal);

            showToast(`Swapped to ${newMeal.name}!`, 'success');
        }, 300);
    };

    const handleClearPlan = () => {
        if (window.confirm('Are you sure you want to clear your meal plan?')) {
            triggerLoader(async () => {
                await clearPlan();
                showToast('Meal plan cleared!', 'success');
            }, 300);
        }
    };

    const costPerDay = stats ? (stats.totalCost / 7).toFixed(2) : '0';
    const hasMeals = todayMeals && todayMeals.length > 0;

    if (!plan || !hasMeals) {
        return (
            <>
                <div className="view-header">
                    <h2 className="view-title">Dietary Plan</h2>
                    <p className="view-subtitle">{!plan ? 'No active plan yet' : 'No meals planned for today'}</p>
                </div>
                {!plan && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <p>Create a plan in the AI Nutritionist to get started</p>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <div className="view-header">
                <h2 className="view-title">Dietary Plan</h2>
                <p className="view-subtitle">
                    {plan.dietType.charAt(0).toUpperCase() + plan.dietType.slice(1)} • {plan.calorieTarget} kcal • ${costPerDay}/day
                </p>
                {hasMeals && (
                    <button
                        className="btn-clear"
                        onClick={handleClearPlan}
                        style={{ marginTop: '10px', background: 'var(--error)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'inline-block' }}
                    >
                        Clear Meal Plan
                    </button>
                )}
            </div>

            <div className="meal-grid">
                {todayMeals.map((meal, idx) => {
                    const proteinPercent = Math.round((meal.protein / (plan.calorieTarget * 0.3 / 4)) * 100);

                    return (
                        <div key={meal.id} className="meal-card">
                            <div className="meal-image-header">
                                {MEAL_ICONS[meal.mealType]}
                            </div>
                            <div className="meal-content">
                                <h3 className="meal-title">
                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}: {meal.name}
                                </h3>
                                <div className="meal-meta">
                                    <span className="meta-pill">
                                        {CALORIE_ICON}
                                        {meal.kcal} kcal
                                    </span>
                                    <span className="meta-pill">
                                        {TIME_ICON}
                                        {meal.prepMinutes} min
                                    </span>
                                    <span className="meta-pill">${meal.cost.toFixed(2)}</span>
                                </div>
                                <p className="meal-desc">{meal.description}</p>
                                <div className="macro-bar">
                                    <div className="macro-label">
                                        <span>Protein ({meal.protein}g)</span>
                                        <span>{Math.min(proteinPercent, 100)}% target</span>
                                    </div>
                                    <div className="macro-progress">
                                        <div className="macro-fill" style={{ width: `${Math.min(proteinPercent, 100)}%` }}></div>
                                    </div>
                                </div>
                                <button
                                    className="btn-swap"
                                    onClick={() => handleMealSwap(meal.id, idx + 1)}
                                >
                                    Swap This Meal
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
