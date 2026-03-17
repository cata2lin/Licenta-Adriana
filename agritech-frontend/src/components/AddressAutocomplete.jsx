/**
 * AddressAutocomplete — Production-grade Romanian address autocomplete
 * 
 * Uses backend /maps/autocomplete proxy (Google Maps Places API or mock fallback).
 * Features:
 * - Debounced search (300ms)
 * - Dropdown with address suggestions
 * - Returns full address with placeId, coordinates, zip code, county
 * - Keyboard navigation (↑↓ Enter Escape)
 * - Click-outside-to-close
 * - Accessible (aria attributes)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder = 'Caută adresă...', label, className = '' }) {
    const [inputValue, setInputValue] = useState(value || '');
    const [predictions, setPredictions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    // Sync external value
    useEffect(() => { if (value !== undefined && value !== inputValue) setInputValue(value); }, [value]);

    // Click outside to close
    useEffect(() => {
        const handleClick = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Debounced autocomplete
    const fetchPredictions = useCallback(async (input) => {
        if (!input || input.length < 2) { setPredictions([]); return; }
        setLoading(true);
        try {
            const data = await api.get(`/maps/autocomplete?input=${encodeURIComponent(input)}`);
            setPredictions(data.predictions || []);
            setIsOpen(true);
        } catch {
            setPredictions([]);
        } finally { setLoading(false); }
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange?.(val);
        setActiveIndex(-1);

        // Debounce
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
    };

    const selectPrediction = async (prediction) => {
        setInputValue(prediction.description);
        setIsOpen(false);
        setPredictions([]);
        onChange?.(prediction.description);

        // Fetch full details (coordinates, zip, county)
        try {
            const details = await api.get(`/maps/place-details/${prediction.placeId}`);
            onSelect?.({
                address: prediction.description,
                placeId: prediction.placeId,
                mainText: prediction.mainText,
                ...details,
            });
        } catch {
            onSelect?.({
                address: prediction.description,
                placeId: prediction.placeId,
                mainText: prediction.mainText,
            });
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || predictions.length === 0) return;
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); setActiveIndex(i => Math.min(i + 1, predictions.length - 1)); break;
            case 'ArrowUp': e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); break;
            case 'Enter': e.preventDefault(); if (activeIndex >= 0) selectPrediction(predictions[activeIndex]); break;
            case 'Escape': setIsOpen(false); break;
        }
    };

    return (
        <div ref={wrapperRef} className={`address-autocomplete ${className}`} style={{ position: 'relative' }}>
            {label && <label className="form-label">{label}</label>}
            <div style={{ position: 'relative' }}>
                <input
                    className="form-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => predictions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    style={{ minHeight: 44, paddingRight: loading ? '2.5rem' : undefined }}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                />
                {loading && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, border: '2px solid var(--border-color)', borderTopColor: 'var(--gold-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                )}
            </div>
            {isOpen && predictions.length > 0 && (
                <ul
                    role="listbox"
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)', marginTop: 4, padding: 0,
                        listStyle: 'none', maxHeight: 250, overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                >
                    {predictions.map((p, i) => (
                        <li
                            key={p.placeId}
                            role="option"
                            aria-selected={i === activeIndex}
                            onClick={() => selectPrediction(p)}
                            style={{
                                padding: '0.65rem 0.85rem', cursor: 'pointer',
                                background: i === activeIndex ? 'var(--bg-hover)' : 'transparent',
                                borderBottom: i < predictions.length - 1 ? '1px solid var(--border-color)' : 'none',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={() => setActiveIndex(i)}
                        >
                            <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>📍 {p.mainText}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.secondaryText}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
