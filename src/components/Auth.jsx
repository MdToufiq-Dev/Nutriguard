import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    font: 'inherit',
};

const selectStyle = { ...inputStyle };

function Field({ label, ...props }) {
    return (
        <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor={props.id}>{label}</label>
            <input {...props} style={inputStyle} />
        </div>
    );
}

export default function Auth({ initialView = 'login' }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [view, setView] = useState(initialView);
    const [submitting, setSubmitting] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [form, setForm] = useState({
        name: '',
        country: '',
        age: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
        height_cm: '',
        weight_kg: '',
        occupation: '',
        lifestyle: '',
        diseases: '',
        has_diabetes: false,
        bp_status: '',
        workout_routine: '',
        yoga_practice: '',
    });

    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    const update = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const showError = (error) => {
        showToast(error.message || 'Something went wrong. Please try again.', 'error');
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const response = await post('/auth/login', {
                email: form.email,
                password: form.password,
            });
            login(response.user, response.token);
            showToast('Welcome back!', 'success');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            showError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const response = await post('/auth/register', {
                name: form.name,
                country: form.country,
                age: form.age ? Number(form.age) : undefined,
                email: form.email,
                phone: form.phone,
                password: form.password,
            });
            setPendingEmail(form.email.trim().toLowerCase());
            setDevOtp(response.otp || '');
            setView('otp');
            showToast(response.otp ? `Development OTP: ${response.otp}` : 'Verification code sent to your email.', 'success');
        } catch (error) {
            showError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const response = await post('/auth/verify-otp', {
                email: pendingEmail,
                otp: form.otp,
            });
            login(response.user, response.token);
            setView('medical');
            showToast('Email verified. Complete your health profile.', 'success');
        } catch (error) {
            showError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setSubmitting(true);
        try {
            const response = await post('/auth/resend-otp', { email: pendingEmail });
            setDevOtp(response.otp || '');
            showToast(response.otp ? `Development OTP: ${response.otp}` : 'A new verification code was sent.', 'success');
        } catch (error) {
            showError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMedicalProfile = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await post('/auth/medical-profile', {
                height_cm: form.height_cm ? Number(form.height_cm) : null,
                weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
                occupation: form.occupation,
                lifestyle: form.lifestyle,
                diseases: form.diseases,
                has_diabetes: form.has_diabetes,
                bp_status: form.bp_status,
                workout_routine: form.workout_routine,
                yoga_practice: form.yoga_practice,
            });
            showToast('Health profile saved.', 'success');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            showError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const switchView = (nextView) => {
        setView(nextView);
        if (nextView === 'login') navigate('/login', { replace: true });
        if (nextView === 'signup') navigate('/signup', { replace: true });
    };

    return (
        <main style={{ minHeight: 'calc(100vh - 80px)', display: 'grid', placeItems: 'center', padding: '32px 0' }}>
            <section className="sandbox" style={{ width: '100%', maxWidth: '620px', margin: 0 }}>
                {view === 'login' && (
                    <>
                        <h2>Welcome Back</h2>
                        <p className="sandbox-subtitle">Sign in to access your personalized nutrition plan.</p>
                        <form onSubmit={handleLogin}>
                            <Field id="login-email" name="email" label="Email" type="email" value={form.email} onChange={update} required autoComplete="email" />
                            <Field id="login-password" name="password" label="Password" type="password" value={form.password} onChange={update} required autoComplete="current-password" />
                            <button className="btn-generate" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign In'}</button>
                        </form>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
                            New to NutriGuard?{' '}
                            <button type="button" className="btn btn-outline" onClick={() => switchView('signup')}>Create an account</button>
                        </p>
                    </>
                )}

                {view === 'signup' && (
                    <>
                        <h2>Create Your Account</h2>
                        <p className="sandbox-subtitle">Verify your email to start your personalized nutrition journey.</p>
                        <form onSubmit={handleRegister}>
                            <Field id="signup-name" name="name" label="Full name" type="text" value={form.name} onChange={update} required autoComplete="name" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <Field id="signup-country" name="country" label="Country" type="text" value={form.country} onChange={update} required autoComplete="country-name" />
                                <Field id="signup-age" name="age" label="Age" type="number" min="1" value={form.age} onChange={update} required />
                            </div>
                            <Field id="signup-email" name="email" label="Email" type="email" value={form.email} onChange={update} required autoComplete="email" />
                            <Field id="signup-phone" name="phone" label="Phone number" type="tel" value={form.phone} onChange={update} required autoComplete="tel" />
                            <Field id="signup-password" name="password" label="Password (at least 6 characters)" type="password" minLength="6" value={form.password} onChange={update} required autoComplete="new-password" />
                            <button className="btn-generate" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create Account'}</button>
                        </form>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
                            Already registered?{' '}
                            <button type="button" className="btn btn-outline" onClick={() => switchView('login')}>Sign in</button>
                        </p>
                    </>
                )}

                {view === 'otp' && (
                    <>
                        <h2>Verify Your Email</h2>
                        <p className="sandbox-subtitle">Enter the six-digit code sent to {pendingEmail}.</p>
                        {devOtp && <p style={{ color: 'var(--warning)', textAlign: 'center', marginBottom: '16px' }}>Development mode code: <strong>{devOtp}</strong></p>}
                        <form onSubmit={handleVerify}>
                            <Field id="otp" name="otp" label="Verification code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={form.otp} onChange={update} required autoComplete="one-time-code" />
                            <button className="btn-generate" type="submit" disabled={submitting}>{submitting ? 'Verifying...' : 'Verify Email'}</button>
                        </form>
                        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '12px' }} onClick={handleResend} disabled={submitting}>Resend code</button>
                    </>
                )}

                {view === 'medical' && (
                    <>
                        <h2>Complete Your Health Profile</h2>
                        <p className="sandbox-subtitle">These details help NutriGuard personalize your plan. You can update them later.</p>
                        <form onSubmit={handleMedicalProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <Field id="height" name="height_cm" label="Height (cm)" type="number" min="1" value={form.height_cm} onChange={update} />
                                <Field id="weight" name="weight_kg" label="Weight (kg)" type="number" min="1" step="0.1" value={form.weight_kg} onChange={update} />
                            </div>
                            <Field id="occupation" name="occupation" label="Occupation" type="text" value={form.occupation} onChange={update} />
                            <Field id="lifestyle" name="lifestyle" label="Lifestyle" type="text" placeholder="For example: mostly sedentary" value={form.lifestyle} onChange={update} />
                            <Field id="diseases" name="diseases" label="Conditions or allergies" type="text" value={form.diseases} onChange={update} />
                            <div className="form-group">
                                <label htmlFor="bp-status">Blood pressure status</label>
                                <select id="bp-status" name="bp_status" value={form.bp_status} onChange={update} style={selectStyle}>
                                    <option value="">Prefer not to say</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                <input type="checkbox" name="has_diabetes" checked={form.has_diabetes} onChange={update} />
                                I have diabetes
                            </label>
                            <Field id="workout" name="workout_routine" label="Workout routine" type="text" value={form.workout_routine} onChange={update} />
                            <Field id="yoga" name="yoga_practice" label="Yoga practice" type="text" value={form.yoga_practice} onChange={update} />
                            <button className="btn-generate" type="submit" disabled={submitting}>{submitting ? 'Saving profile...' : 'Save and Continue'}</button>
                        </form>
                    </>
                )}
            </section>
        </main>
    );
}
