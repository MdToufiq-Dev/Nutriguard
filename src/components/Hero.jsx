import { useState } from 'react';
import { useLoader } from '../contexts/LoaderContext';

export default function Hero({ onFormSubmit }) {
    const { triggerLoader } = useLoader();
    const [goal, setGoal] = useState('weight-loss');
    const [diet, setDiet] = useState('high-protein');
    const [budget, setBudget] = useState(25);

    const handleSubmit = (e) => {
        e.preventDefault();
        triggerLoader(() => {
            onFormSubmit();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1800);
    };

    return (
        <section className="hero" id="heroSection">
            <div className="hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                AI-Powered Clinical Nutrition
            </div>
            <h1>Smart Nutrition for Your Active Lifestyle</h1>
            <p>Personalized meal planning, real-time metabolic adaptation, and healthy food discovery tailored to your goals.</p>

            <div className="sandbox">
                <h2>Try It Now – Instant Preview</h2>
                <p className="sandbox-subtitle">Choose 3 levers to generate your calibrated nutrition plan</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>What is your primary goal?</label>
                        <div className="radio-grid">
                            <div className="radio-card">
                                <input type="radio" name="goal" value="weight-loss" id="goal1" checked={goal === 'weight-loss'} onChange={(e) => setGoal(e.target.value)} />
                                <label htmlFor="goal1">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>
                                    </span>
                                    <span>Weight Loss</span>
                                </label>
                            </div>
                            <div className="radio-card">
                                <input type="radio" name="goal" value="muscle-gain" id="goal2" checked={goal === 'muscle-gain'} onChange={(e) => setGoal(e.target.value)} />
                                <label htmlFor="goal2">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11M21 21l-1-1a3 3 0 0 1-4.24-4.24l-8.52-8.52A3 3 0 0 1 3 3l1 1M18 6l-2-2a2.83 2.83 0 0 0-4 0l-1 1M8 18l2 2a2.83 2.83 0 0 0 4 0l1-1"/></svg>
                                    </span>
                                    <span>Muscle Gain</span>
                                </label>
                            </div>
                            <div className="radio-card">
                                <input type="radio" name="goal" value="energy-balance" id="goal3" checked={goal === 'energy-balance'} onChange={(e) => setGoal(e.target.value)} />
                                <label htmlFor="goal3">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    </span>
                                    <span>Energy Balance</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dietary preference style?</label>
                        <div className="radio-grid">
                            <div className="radio-card">
                                <input type="radio" name="diet" value="high-protein" id="diet1" checked={diet === 'high-protein'} onChange={(e) => setDiet(e.target.value)} />
                                <label htmlFor="diet1">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.4 15.6 3.4-3.4a4.8 4.8 0 0 0 0-6.8 4.8 4.8 0 0 0-6.8 0l-3.4 3.4M12.6 12.8l-3.4 3.4a4.8 4.8 0 0 0 0 6.8 4.8 4.8 0 0 0 6.8 0l3.4-3.4M6.2 12.6a4.8 4.8 0 0 1-6.8 0 4.8 4.8 0 0 1 0-6.8l3.4-3.4a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8l-3.4 3.4z"/></svg>
                                    </span>
                                    <span>High Protein</span>
                                </label>
                            </div>
                            <div className="radio-card">
                                <input type="radio" name="diet" value="vegetarian" id="diet2" checked={diet === 'vegetarian'} onChange={(e) => setDiet(e.target.value)} />
                                <label htmlFor="diet2">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                                    </span>
                                    <span>Vegetarian</span>
                                </label>
                            </div>
                            <div className="radio-card">
                                <input type="radio" name="diet" value="keto" id="diet3" checked={diet === 'keto'} onChange={(e) => setDiet(e.target.value)} />
                                <label htmlFor="diet3">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                    </span>
                                    <span>Keto</span>
                                </label>
                            </div>
                            <div className="radio-card">
                                <input type="radio" name="diet" value="mediterranean" id="diet4" checked={diet === 'mediterranean'} onChange={(e) => setDiet(e.target.value)} />
                                <label htmlFor="diet4">
                                    <span className="radio-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 4 3.57 6.46 4 9 4 12s-.43 5.54-1.27 8C5.58 18.03 7 16 7 13.33"/></svg>
                                    </span>
                                    <span>Mediterranean</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Daily food budget target?</label>
                        <div className="slider-container">
                            <div className="slider-value">$<span>{budget}</span> / day</div>
                            <input
                                type="range"
                                id="budgetSlider"
                                min="10"
                                max="50"
                                value={budget}
                                step="5"
                                onChange={(e) => setBudget(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-generate">Generate My Instant Plan</button>
                </form>
            </div>
        </section>
    );
}
