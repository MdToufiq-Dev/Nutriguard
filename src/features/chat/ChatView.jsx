import { useState, useEffect } from 'react';
import { useLoader } from '../../contexts/LoaderContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../integration/useCurrentUser';
import { getHealthProfile } from '../../integration/getHealthProfile';
import * as planService from '../../services/planService';
import { generatePlan } from '../../utils/planGenerator';

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
        message: 'What\'s your daily calorie goal?',
        type: 'input',
        inputType: 'number',
        placeholder: '2000',
        validation: (val) => {
            const num = parseInt(val);
            return num >= 1000 && num <= 5000;
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
        message: 'What\'s your budget preference?',
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
        dynamic: true, // Will be populated from health profile
    },
    {
        id: 'review',
        title: 'Plan Review',
        message: 'Here\'s your personalized plan!',
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

    // Load health profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getHealthProfile(user.id);
            setHealthProfile(profile);
        };
        loadProfile();
    }, [user.id]);

    const step = CHAT_STEPS[currentStep];

    const handleResponse = async (value) => {
        const updated = { ...responses, [step.id]: value };
        setResponses(updated);

        // If last step, generate plan
        if (currentStep === CHAT_STEPS.length - 1) {
            await triggerLoader(async () => {
                const plan = generatePlan({
                    dietType: updated.welcome,
                    calorieTarget: parseInt(updated.calories),
                    allergens: [
                        ...(updated.allergens || []),
                        ...(updated.allergies_check ? (healthProfile?.allergens || []) : []),
                    ],
                    dislikedFoods: (updated.disliked || '').split(',').map(f => f.trim()).filter(Boolean),
                    userId: user.id,
                });

                const saved = await planService.createPlan(plan);
                setGeneratedPlan(saved);
                setIsComplete(true);

                showToast('Diet plan created successfully!', 'success');
            }, 300);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleActivatePlan = async () => {
        if (!generatedPlan) return;

        await triggerLoader(async () => {
            const today = new Date().toISOString().split('T')[0];
            await planService.activateUserPlan(user.id, generatedPlan.id, today);
            showToast('Diet plan activated!', 'success');

            // Reset for new plan
            setTimeout(() => {
                setCurrentStep(0);
                setResponses({});
                setGeneratedPlan(null);
                setIsComplete(false);
            }, 1500);
        }, 300);
    };

    if (isComplete && generatedPlan) {
        return (
            <div className="chat-container">
                <div className="chat-message assistant">
                    <div className="message-content">
                        <h3>🎉 Your Plan is Ready!</h3>
                        <div className="plan-summary">
                            <div className="summary-stat">
                                <span className="stat-label">Diet Type</span>
                                <span className="stat-value">{generatedPlan.dietType}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Daily Calories</span>
                                <span className="stat-value">{generatedPlan.calorieTarget} kcal</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Duration</span>
                                <span className="stat-value">7 days</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleActivatePlan}>
                    Activate My Plan
                </button>
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
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    const value = e.target.value;
                                    if (step.validation && !step.validation(value)) {
                                        showToast(step.errorMessage, 'error');
                                        return;
                                    }
                                    handleResponse(value);
                                }
                            }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                const input = document.querySelector('.input-group input');
                                const value = input.value;
                                if (step.validation && !step.validation(value)) {
                                    showToast(step.errorMessage, 'error');
                                    return;
                                }
                                handleResponse(value);
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

                {step.type === 'confirm' && healthProfile && (
                    <div className="confirm-section">
                        <p className="confirm-text">
                            Found in your profile: {healthProfile.allergens?.join(', ') || 'None'}
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
            </div>

            {currentStep > 0 && (
                <button className="btn-text" onClick={handlePrevious}>
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
