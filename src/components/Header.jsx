import { useState, useEffect } from 'react';
import { useLoader } from '../contexts/LoaderContext';

export default function Header({ onGetStartedClick, heroVisible }) {
    const { triggerLoader } = useLoader();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('nutri_theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleThemeToggle = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('nutri_theme', nextTheme);
    };

    const handleSignIn = () => {
        triggerLoader(() => {
            alert('🔑 Sign In modal / Identifier-First login routing ready.');
        }, 800);
    };

    return (
        <header>
            <div className="container">
                <div className="header-content">
                    <a href="#" className="logo">
                        <div className="logo-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10M12 20v-8M8 12h8L12 4z"/></svg>
                        </div>
                        <span>NUTRIGUARD</span>
                    </a>
                    <div className="nav-actions">
                        <button className="theme-toggle" onClick={handleThemeToggle} aria-label="Toggle theme">
                            <div className="theme-toggle-inner" style={{ transform: theme === 'light' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                <svg className="theme-icon moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                <svg className="theme-icon sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            </div>
                        </button>
                        <button className="btn btn-outline btn-header-cta" onClick={handleSignIn}>Sign In</button>
                        <button className="btn btn-primary btn-header-cta" onClick={onGetStartedClick}>Get Started</button>
                    </div>
                </div>
            </div>
        </header>
    );
}
