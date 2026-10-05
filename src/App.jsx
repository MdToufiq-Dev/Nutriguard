import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LoaderProvider } from './contexts/LoaderContext';
import { ToastProvider } from './contexts/ToastContext';
import Loader from './components/Loader';
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

function App() {
    return (
        <BrowserRouter>
            <LoaderProvider>
                <ToastProvider>
                    <Loader />
                    <AppContent />
                </ToastProvider>
            </LoaderProvider>
        </BrowserRouter>
    );
}

function AppContent() {
    const [heroVisible, setHeroVisible] = useState(true);

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
                        heroVisible ? (
                            <Hero onFormSubmit={() => setHeroVisible(false)} />
                        ) : (
                            <Navigate to="/dashboard" replace />
                        )
                    } />

                    {/* App routes - reserved: /login, /profile (coworker owns) */}
                    <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                    <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
                    <Route path="/meals" element={<AppLayout><Meals /></AppLayout>} />
                    <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
                    <Route path="/scan" element={<AppLayout><Scanner /></AppLayout>} />
                    <Route path="/radar" element={<AppLayout><Radar /></AppLayout>} />

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
