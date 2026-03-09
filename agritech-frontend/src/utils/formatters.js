/**
 * Utility functions for formatting values consistently across the app.
 * Single source of truth for display formatting rules.
 */

/** Format a number as Romanian currency (RON) */
export function formatRON(amount) {
    if (amount == null) return '—';
    return `${amount.toLocaleString('ro-RO')} RON`;
}

/** Format a number as price per tonne */
export function formatPricePerTonne(price) {
    if (price == null) return '—';
    return `${price.toLocaleString('ro-RO')} RON/t`;
}

/** Format a percentage with specified decimals */
export function formatPercent(value, decimals = 1) {
    if (value == null) return '—';
    return `${value.toFixed(decimals)}%`;
}

/** Format a date to Romanian locale string */
export function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ro-RO');
}

/** Format a timestamp to Romanian locale datetime */
export function formatDateTime(date) {
    if (!date) return '—';
    return new Date(date).toLocaleString('ro-RO');
}

/** Shorten large numbers (e.g., 1500000 → "1.5M") */
export function formatCompact(num) {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
}

/** Generate a unique ID */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Generate an order ID in the AGR format */
export function generateOrderId() {
    return `AGR-${Date.now().toString().slice(-7)}`;
}

/** Generate a UIT code */
export function generateUIT() {
    return `RO24T-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
}
