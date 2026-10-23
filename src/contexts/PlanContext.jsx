import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as planService from '../services/planService';
import { useAuth } from './AuthContext';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPlan = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const activePlan = await planService.getActivePlan();
            setPlan(activePlan);
        } catch (error) {
            setPlan(null);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadPlan();
    }, [loadPlan]);

    const swapMeal = async (dayNumber, mealId, newMeal) => {
        const updated = await planService.swapMealInPlan(dayNumber, mealId, newMeal);
        if (updated) {
            setPlan(updated);
        }
        return updated;
    };

    const activatePlan = async (planId, startDate) => {
        const updated = await planService.activateUserPlan(planId, startDate);
        if (updated) {
            setPlan(updated);
        }
        return updated;
    };

    const clearPlan = async () => {
        const updated = await planService.clearPlan();
        if (updated) {
            setPlan(updated);
        }
        return updated;
    };

    return (
        <PlanContext.Provider value={{ plan, loading, loadPlan, swapMeal, activatePlan, clearPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    const context = useContext(PlanContext);
    if (!context) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
}
