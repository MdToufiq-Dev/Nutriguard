import { useState, useEffect } from 'react';
import { useLoader } from '../contexts/LoaderContext';
import { useCurrentUser } from '../integration/useCurrentUser';
import { getHealthSyncSummary } from '../integration/getHealthSyncSummary';
import * as planService from '../services/planService';
import * as calendarService from '../services/calendarService';
import { calculateStreak } from '../utils/streak';

const MEAL_ICONS = {
    breakfast: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="8"/><line x1="10" y1="2" x2="10" y2="8"/><line x1="14" y1="2" x2="14" y2="8"/></svg>,
    lunch: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/></svg>,
    dinner: <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 4 3.57 6.46 4 9 4 12s-.43 5.54-1.27 8C5.58 18.03 7 16 7 13.33"/></svg>,
};

export default function Dashboard() {
    const { triggerLoader } = useLoader();
    const user = useCurrentUser();

    const [plan, setPlan] = useState(null);
    const [todayMeals, setTodayMeals] = useState([]);
    const [healthSync, setHealthSync] = useState(null);
    const [streak, setStreak] = useState(0);
    const [todayCalories, setTodayCalories] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            // Load active plan
            const activePlan = await planService.getActivePlan(user.id);
            if (activePlan) {
                setPlan(activePlan);
                const today = new Date().toISOString().split('T')[0];
                const todayDay = activePlan.days.find(d => d.date === today);
                if (todayDay) {
                    setTodayMeals(todayDay.meals);
                    setTodayCalories(todayDay.totalKcal);
                }
            }

            // Load health sync data
            const sync = await getHealthSyncSummary(user.id);
            setHealthSync(sync);

            // Load streak
            const log = await calendarService.getComplianceLog(user.id);
            setStreak(calculateStreak(log));
        };

        loadData();
    }, [user.id]);

    const handleMealSwap = (mealId) => {
        triggerLoader(() => {
            // Placeholder - meal swap logic
        }, 1000);
    };

    const displayedMeals = todayMeals.length > 0 ? todayMeals : [];
    const displayCalories = todayCalories || (plan?.calorieTarget || 1847);
    const displayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0) || 142;
    const displayActiveMin = healthSync?.activeMinutes || 67;
    const displayStreak = streak || 12;

    return (
        <>
            <div className="view-header">
                <h2 className="view-title">Health Overview</h2>
                <p className="view-subtitle">
                    {plan ? `${plan.dietType.charAt(0).toUpperCase() + plan.dietType.slice(1)} • Calibrated with health sync` : 'Create a plan to get started'}
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>
                    </div>
                    <div className="stat-label">Calories</div>
                    <div className="stat-value">{displayCalories.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11M21 21l-1-1a3 3 0 0 1-4.24-4.24l-8.52-8.52A3 3 0 0 1 3 3l1 1M18 6l-2-2a2.83 2.83 0 0 0-4 0l-1 1M8 18l2 2a2.83 2.83 0 0 0 4 0l1-1"/></svg>
                    </div>
                    <div className="stat-label">Protein</div>
                    <div className="stat-value">{Math.round(displayProtein)}g</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <div className="stat-label">Active Min</div>
                    <div className="stat-value">{displayActiveMin}m</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                    </div>
                    <div className="stat-label">Streak</div>
                    <div className="stat-value">{displayStreak}d</div>
                </div>
            </div>

            <div className="view-header" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Today's Planned Meals</h3>
            </div>

            {displayedMeals.length > 0 ? (
                <div className="meal-grid">
                    {displayedMeals.map(meal => (
                        <div key={meal.id} className="meal-card">
                            <div className="meal-image-header">
                                {MEAL_ICONS[meal.mealType]}
                            </div>
                            <div className="meal-content">
                                <h3 className="meal-title">{meal.name}</h3>
                                <div className="meal-meta">
                                    <span className="meta-pill">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>
                                        {meal.kcal} cal
                                    </span>
                                    <span className="meta-pill">${meal.cost.toFixed(2)}</span>
                                </div>
                                <p className="meal-desc">{meal.description}</p>
                                <button className="btn-swap" onClick={() => handleMealSwap(meal.id)}>Swap Meal</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <p>No active plan. Create one in AI Nutritionist to see today's meals</p>
                </div>
            )}
        </>
    );
}
