/**
 * Custom hook for persisting state to localStorage.
 * Replaces the repeated pattern of useState + useEffect + JSON parse/stringify.
 * 
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - The default value if nothing is stored
 * @returns {[*, Function]} - [value, setValue] pair
 */
import { useState, useEffect } from 'react';

export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved !== null ? JSON.parse(saved) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            if (value === null || value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (e) {
            console.warn(`Failed to save to localStorage key "${key}":`, e);
        }
    }, [key, value]);

    return [value, setValue];
}
