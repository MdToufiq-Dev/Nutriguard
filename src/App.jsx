import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LoaderProvider } from './contexts/LoaderContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/Loader';
import Auth from './components/Auth';
import Header from './components/Header';
import Hero from './components/Hero';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Meals from './components/Meals';
import Calendar from './components/Calendar';
import Scanner from './components/Scanner';
import Radar from './components/Radar';
import './styles/global.css';

import { PlanProvider } from './contexts/PlanContext';
// ... (imports)
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <PlanProvider>
                    <LoaderProvider>
                        <ToastProvider>
                            <Loader />
                            <AppContent />
                        </ToastProvider>
                    </LoaderProvider>
                </PlanProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [heroVisible, setHeroVisible] = useState(true);

    if (loading) {
        return null;
    }

    const handleGetStartedClick = () => {
        const heroSection = document.getElementById('heroSection');
        if (heroSection && heroVisible) {
            heroSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Header onGetStartedClick={handleGetStartedClick} heroVisible={heroVisible} />
            <div className="container">
                <Routes>
                    {/* Landing page with hero */}
                    <Route path="/" element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : (
                            heroVisible ? (
                                <Hero onFormSubmit={() => setHeroVisible(false)} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        )
                    } />

                    {/* Authentication */}
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />
                    <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth initialView="signup" />} />

                    {/* Protected app routes */}
                    <Route path="/dashboard" element={isAuthenticated ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/login" replace />} />
                    <Route path="/chat" element={isAuthenticated ? <AppLayout><Chat /></AppLayout> : <Navigate to="/login" replace />} />
                    <Route path="/meals" element={isAuthenticated ? <AppLayout><Meals /></AppLayout> : <Navigate to="/login" replace />} />
                    <Route path="/calendar" element={isAuthenticated ? <AppLayout><Calendar /></AppLayout> : <Navigate to="/login" replace />} />
                    <Route path="/scan" element={isAuthenticated ? <AppLayout><Scanner /></AppLayout> : <Navigate to="/login" replace />} />
                    <Route path="/radar" element={isAuthenticated ? <AppLayout><Radar /></AppLayout> : <Navigate to="/login" replace />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    );
}

function AppLayout({ children }) {
    return (
        <>
            <div className="app-container active" id="appContainer">
                <Sidebar />
                <main className="main-content">
                    <div className="view active">
                        {children}
                    </div>
                </main>
            </div>
            <MobileBottomNav />
        </>
    );
}

export default App;
