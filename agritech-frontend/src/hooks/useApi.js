/**
 * useApi — Custom hook for API data fetching with loading/error states.
 * 
 * Provides a consistent pattern across all pages for API calls.
 * Supports: initial fetch, refetch, and optimistic updates.
 * Falls back gracefully when the backend is unavailable.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for fetching data from an API endpoint.
 * @param {Function} fetchFn — Async function that returns data (e.g., () => tradingService.getCommodities())
 * @param {any} fallbackData — Data to use when API is unavailable
 * @param {boolean} autoFetch — Whether to fetch on mount (default: true)
 * @returns {{ data, loading, error, refetch, setData }}
 */
export function useApi(fetchFn, fallbackData = null, autoFetch = true) {
    const [data, setData] = useState(fallbackData);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            if (mountedRef.current) {
                setData(result);
                setLoading(false);
            }
            return result;
        } catch (err) {
            if (mountedRef.current) {
                // If network error, silently use fallback data
                if (err.isNetworkError) {
                    console.warn('[useApi] Backend unavailable, using fallback data');
                    setData(fallbackData);
                } else {
                    setError(err.message || 'Eroare la încărcarea datelor');
                }
                setLoading(false);
            }
            return null;
        }
    }, [fetchFn, fallbackData]);

    useEffect(() => {
        mountedRef.current = true;
        if (autoFetch) fetch();
        return () => { mountedRef.current = false; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, loading, error, refetch: fetch, setData };
}

/**
 * Hook for performing API mutations (create, update, delete).
 * @param {Function} mutateFn — Async function that performs the mutation
 * @returns {{ mutate, loading, error }}
 */
export function useMutation(mutateFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await mutateFn(...args);
            setLoading(false);
            return { success: true, data: result };
        } catch (err) {
            setError(err.message || 'Eroare la procesare');
            setLoading(false);
            return { success: false, error: err.message };
        }
    }, [mutateFn]);

    return { mutate, loading, error };
}

export default useApi;
