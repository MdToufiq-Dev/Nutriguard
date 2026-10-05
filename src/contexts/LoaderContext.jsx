import { createContext, useContext, useState } from 'react';

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
    const [isActive, setIsActive] = useState(false);

    const triggerLoader = (callback, duration = 1500) => {
        setIsActive(true);
        setTimeout(() => {
            setIsActive(false);
            if (callback) callback();
        }, duration);
    };

    return (
        <LoaderContext.Provider value={{ isActive, triggerLoader }}>
            {children}
        </LoaderContext.Provider>
    );
}

export function useLoader() {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
}
