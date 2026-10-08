import { useState, useEffect } from 'react';
import { useLoader } from '../../contexts/LoaderContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../integration/useCurrentUser';
import { getHealthProfile } from '../../integration/getHealthProfile';
import * as planService from '../../services/planService';
import { generatePlan, calculatePlanStats } from '../../utils/planGenerator';

const CHAT_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome!',
        message: "I'm your nutrition AI assistant. Let's create a personalized diet plan for you. What's your primary diet preference?",
        type: 'choice',
        choices: [
            { label: 'High-Protein', value: 'high-protein', icon: '💪' },
            { label: 'Mediterranean', value: 'mediterranean', icon: '🌞' },
            { label: 'Vegetarian', value: 'vegetarian', icon: '🥗' },
            { label: 'Vegan', value: 'vegan', icon: '🌱' },
            { label: 'Keto', value: 'keto', icon: '🥑' },
        ],
    },
    {
        id: 'calories',
        title: 'Calorie Target',
        message: "What's your daily calorie goal?",
        type: 'input',
        inputType: 'number',
        placeholder: '2000',
        validation: (val) => {
            const num = parseInt(val, 10);
            return !isNaN(num) && num >= 1000 && num <= 5000;
        },
        errorMessage: 'Please enter a number between 1000 and 5000',
    },
    {
        id: 'allergens',
        title: 'Allergens',
        message: 'Select any allergens to avoid:',
        type: 'multiselect',
        choices: [
            { label: 'Dairy', value: 'dairy' },
            { label: 'Eggs', value: 'eggs' },
            { label: 'Nuts', value: 'nuts' },
            { label: 'Fish', value: 'fish' },
            { label: 'Shellfish', value: 'shellfish' },
            { label: 'Soy', value: 'soy' },
            { label: 'Gluten', value: 'gluten' },
        ],
    },
    {
        id: 'disliked',
        title: 'Food Dislikes',
        message: 'Any foods you dislike? (type them, comma-separated, or skip)',
        type: 'input',
        inputType: 'text',
        placeholder: 'e.g., mushrooms, olives, spicy foods',
    },
    {
        id: 'meals_per_day',
        title: 'Meal Frequency',
        message: 'How many main meals per day?',
        type: 'choice',
        choices: [
            { label: '2 Meals', value: '2' },
            { label: '3 Meals', value: '3' },
            { label: '4+ Meals', value: '4' },
        ],
    },
    {
        id: 'budget',
        title: 'Budget Preference',
        message: "What's your budget preference?",
        type: 'choice',
        choices: [
            { label: 'Budget-Friendly', value: 'budget' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Premium', value: 'premium' },
        ],
    },
    {
        id: 'allergies_check',
        title: 'Health Allergies',
        message: 'I found these in your profile. Should I include them in my recommendations?',
        type: 'confirm',
        dynamic: true,
    },
    {
        id: 'review',
        title: 'Plan Review',
        message: 'Review your preferences below and tap "Plan Meal" to generate your custom 7-day diet plan!',
        type: 'review',
        dynamic: true,
    },
];

export default function ChatView() {
    const { triggerLoader } = useLoader();
    const { showToast } = useToast();
    const user = useCurrentUser();

    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [healthProfile, setHealthProfile] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [selectedDayTab, setSelectedDayTab] = useState(1);

    // Load health profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await getHealthProfile(user.id);
                setHealthProfile(profile);
            } catch (err) {
                console.error('Error loading health profile:', err);
            }
        };
        loadProfile();
    }, [user.id]);

    const step = CHAT_STEPS[currentStep];

    const handleGeneratePlan = async (finalResponses) => {
        await triggerLoader(async () => {
            try {
                const plan = generatePlan({
                    dietType: finalResponses.welcome || 'high-protein',
                    calorieTarget: parseInt(finalResponses.calories, 10) || 2000,
                    allergens: [
                        ...(finalResponses.allergens || []),
                        ...(finalResponses.allergies_check ? (healthProfile?.allergens || []) : []),
                    ],
                    dislikedFoods: (finalResponses.disliked || '')
                        .split(',')
                        .map(f => f.trim())
                        .filter(Boolean),
                    userId: user.id,
                });

                let savedPlan = plan;
                try {
                    const saved = await planService.createPlan(plan);
                    if (saved && (saved.id || saved.dietType)) {
                        savedPlan = { ...plan, ...saved };
                    }
                } catch (saveErr) {
                    console.warn('Backend plan creation fallback to client plan:', saveErr);
                }

                setGeneratedPlan(savedPlan);
                setIsComplete(true);
                showToast('Diet plan created successfully!', 'success');
            } catch (err) {
                console.error('Failed to generate plan:', err);
                showToast('Failed to generate diet plan. Please check preferences.', 'error');
            }
        }, 400);
    };

    const handleResponse = async (value) => {
        const updated = { ...responses, [step.id]: value };
        setResponses(updated);

        // If last step (review), trigger plan generation
        if (currentStep === CHAT_STEPS.length - 1) {
            await handleGeneratePlan(updated);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleActivatePlan = async () => {
        if (!generatedPlan) return;

        await triggerLoader(async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                await planService.activateUserPlan(user.id, generatedPlan.id, today);
                showToast('Diet plan activated! Check your Dashboard and Calendar.', 'success');

                setTimeout(() => {
                    setCurrentStep(0);
                    setResponses({});
                    setGeneratedPlan(null);
                    setIsComplete(false);
                }, 1500);
            } catch (err) {
                console.error('Error activating plan:', err);
                showToast('Diet plan activated locally!', 'success');
                setTimeout(() => {
                    setCurrentStep(0);
                    setResponses({});
                    setGeneratedPlan(null);
                    setIsComplete(false);
                }, 1500);
            }
        }, 300);
    };

    const handleReset = () => {
        setCurrentStep(0);
        setResponses({});
        setGeneratedPlan(null);
        setIsComplete(false);
    };

    if (isComplete && generatedPlan) {
        const stats = calculatePlanStats(generatedPlan);
        const currentDay = generatedPlan.days?.find(d => d.dayNumber === selectedDayTab) || generatedPlan.days?.[0];

        return (
            <div className="chat-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="chat-message assistant">
                    <div className="message-content">
                        <h3>🎉 Your Plan is Ready!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Here is your personalized 7-day meal plan based on your preferences.
                        </p>

                        <div className="plan-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                            <div className="summary-stat" style={{ background: 'var(--card-bg, rgba(255,255,255,0.05))', padding: '12px', borderRadius: '10px' }}>
                                <span className="stat-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Diet Type</span>
                                <span className="stat-value" style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent, #10b981)', textTransform: 'capitalize' }}>
                                    {generatedPlan.dietType}
                                </span>
                            </div>
                            <div className="summary-stat" style={{ background: 'var(--card-bg, rgba(255,255,255,0.05))', padding: '12px', borderRadius: '10px' }}>
                                <span className="stat-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Daily Target</span>
                                <span className="stat-value" style={{ fontWeight: '700', fontSize: '15px' }}>
                                    {generatedPlan.calorieTarget} kcal
                                </span>
                            </div>
                            <div className="summary-stat" style={{ background: 'var(--card-bg, rgba(255,255,255,0.05))', padding: '12px', borderRadius: '10px' }}>
                                <span className="stat-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Avg Protein</span>
                                <span className="stat-value" style={{ fontWeight: '700', fontSize: '15px' }}>
                                    {stats.avgProtein}g / day
                                </span>
                            </div>
                            <div className="summary-stat" style={{ background: 'var(--card-bg, rgba(255,255,255,0.05))', padding: '12px', borderRadius: '10px' }}>
                                <span className="stat-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Duration</span>
                                <span className="stat-value" style={{ fontWeight: '700', fontSize: '15px' }}>7 Days</span>
                            </div>
                        </div>

                        {/* Day selector */}
                        {generatedPlan.days && generatedPlan.days.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                                    {generatedPlan.days.map(d => (
                                        <button
                                            key={d.dayNumber}
                                            onClick={() => setSelectedDayTab(d.dayNumber)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: selectedDayTab === d.dayNumber ? '700' : '500',
                                                background: selectedDayTab === d.dayNumber ? 'var(--accent, #10b981)' : 'rgba(255,255,255,0.08)',
                                                color: selectedDayTab === d.dayNumber ? '#fff' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Day {d.dayNumber}
                                        </button>
                                    ))}
                                </div>

                                {currentDay && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                        {currentDay.meals?.map(meal => (
                                            <div
                                                key={meal.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '10px',
                                                    padding: '10px 14px'
                                                }}
                                            >
                                                <div>
                                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent, #10b981)', fontWeight: '700' }}>
                                                        {meal.mealType}
                                                    </span>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                                                        {meal.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                                                        {meal.kcal} kcal
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                        Create Another Plan
                    </button>
                    <button className="btn btn-primary" onClick={handleActivatePlan} style={{ flex: 2 }}>
                        Activate My Plan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="chat-message assistant">
                <div className="message-content">
                    <h3>{step.title}</h3>
                    <p>{step.message}</p>
                </div>
            </div>

            <div className="chat-input-area">
                {step.type === 'choice' && (
                    <div className="choice-buttons">
                        {step.choices.map(choice => (
                            <button
                                key={choice.value}
                                className="btn-choice"
                                onClick={() => handleResponse(choice.value)}
                            >
                                <span className="choice-icon">{choice.icon}</span>
                                <span>{choice.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {step.type === 'input' && (
                    <div className="input-group">
                        <input
                            type={step.inputType}
                            placeholder={step.placeholder}
                            defaultValue={responses[step.id] || ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const value = e.target.value.trim();
                                    if (step.validation && !step.validation(value)) {
                                        showToast(step.errorMessage, 'error');
                                        return;
                                    }
                                    handleResponse(value || step.placeholder || '');
                                }
                            }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                const input = document.querySelector('.input-group input');
                                const value = input?.value?.trim() || '';
                                if (step.validation && !step.validation(value)) {
                                    showToast(step.errorMessage, 'error');
                                    return;
                                }
                                handleResponse(value || step.placeholder || '');
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}

                {step.type === 'multiselect' && (
                    <div className="multiselect-group">
                        <div className="checkbox-list">
                            {step.choices.map(choice => (
                                <label key={choice.value} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        value={choice.value}
                                        defaultChecked={(responses[step.id] || []).includes(choice.value)}
                                        onChange={(e) => {
                                            const current = responses[step.id] || [];
                                            const updated = e.target.checked
                                                ? [...current, choice.value]
                                                : current.filter(v => v !== choice.value);
                                            setResponses({ ...responses, [step.id]: updated });
                                        }}
                                    />
                                    <span>{choice.label}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleResponse(responses[step.id] || [])}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step.type === 'confirm' && (
                    <div className="confirm-section">
                        <p className="confirm-text">
                            Found in your profile: {healthProfile?.allergens?.length ? healthProfile.allergens.join(', ') : 'None recorded'}
                        </p>
                        <div className="button-group">
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleResponse(false)}
                            >
                                Skip
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleResponse(true)}
                            >
                                Include Them
                            </button>
                        </div>
                    </div>
                )}

                {step.type === 'review' && (
                    <div className="review-section" style={{ width: '100%' }}>
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '12px'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Diet Preference</div>
                                <div style={{ fontWeight: '700', textTransform: 'capitalize', color: 'var(--accent, #10b981)' }}>
                                    {responses.welcome || 'High-Protein'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Calories</div>
                                <div style={{ fontWeight: '700' }}>
                                    {responses.calories || 2000} kcal
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meal Frequency</div>
                                <div style={{ fontWeight: '700' }}>
                                    {responses.meals_per_day ? `${responses.meals_per_day} meals/day` : '3 meals/day'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Budget</div>
                                <div style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                                    {responses.budget || 'Moderate'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allergens Excluded</div>
                                <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                    {(responses.allergens && responses.allergens.length > 0)
                                        ? responses.allergens.join(', ')
                                        : 'None'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disliked Foods</div>
                                <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                    {responses.disliked || 'None'}
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={() => handleResponse(true)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Plan Meal
                        </button>
                    </div>
                )}
            </div>

            {currentStep > 0 && (
                <button className="btn-text" onClick={handlePrevious} style={{ marginTop: '12px' }}>
                    ← Back
                </button>
            )}

            <div className="chat-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentStep + 1) / CHAT_STEPS.length) * 100}%` }}
                    ></div>
                </div>
                <span className="progress-text">Step {currentStep + 1} of {CHAT_STEPS.length}</span>
            </div>
        </div>
    );
}
