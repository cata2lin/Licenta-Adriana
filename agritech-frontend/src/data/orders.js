/**
 * Mock orders data for the Financial Module.
 * In production, fetched from the Orders & Escrow API.
 */
export const MOCK_ORDERS = [
    { id: 'AGR-2024-001', product: 'Grâu Panificație (120t)', partner: 'SC MORAR SRL', total: 150000, escrow: 'Fonduri Blocate', escrowType: 'gold', delivery: 'În drum', uit: 'RO24T-0001', timeline: [{ text: 'Contract creat', time: '01.03.2024', done: true }, { text: 'Escrow — Fonduri depuse', time: '02.03.2024 — 150,000 RON', done: true }, { text: 'Transport dispecerat — OSRM 225km', time: '03.03.2024', done: true }, { text: 'Livrare & Recepție', time: 'Estimat: 04.03.2024', done: false }, { text: 'Split Payment eliberat', time: '—', done: false }], sellerAmount: 142500, transportAmount: 4500, platformFee: 3000 },
    { id: 'AGR-2024-002', product: 'Porumb Furajer (85t)', partner: 'SC FEED RO SRL', total: 83300, escrow: 'Eliberat', escrowType: 'green', delivery: 'Livrat', uit: 'RO24T-0002', timeline: [], sellerAmount: 79135, transportAmount: 2500, platformFee: 1665 },
    { id: 'AGR-2024-003', product: 'Fl. Soarelui (200t)', partner: 'SC OIL PRESS SRL', total: 420000, escrow: 'Reținut - Dispută', escrowType: 'red', delivery: 'Livrat', uit: 'RO24T-0003', timeline: [], sellerAmount: 399000, transportAmount: 12600, platformFee: 8400 },
    { id: 'AGR-2024-004', product: 'Rapiță (60t)', partner: 'SC BIO ENERGY SRL', total: 141000, escrow: 'Fonduri Blocate', escrowType: 'gold', delivery: 'Programat', uit: '—', timeline: [], sellerAmount: 133950, transportAmount: 4230, platformFee: 2820 },
    { id: 'AGR-2024-005', product: 'Grâu Clasa B (300t)', partner: 'SC BRUTĂRIA VECHE SRL', total: 354000, escrow: 'Eliberat', escrowType: 'green', delivery: 'Livrat', uit: 'RO24T-0005', timeline: [], sellerAmount: 336300, transportAmount: 10620, platformFee: 7080 },
];

export const MOCK_NOTIFICATIONS = [
    { id: 1, text: 'Ofertă acceptată — SC MORAR SRL', time: 'acum 2 ore', read: false },
    { id: 2, text: 'Plată blocată în Escrow — 45,000 RON', time: 'acum 5 ore', read: false },
    { id: 3, text: 'Livrare confirmată — Cod UIT: RO24T0001', time: 'ieri', read: true },
];

/** Platform fee percentages */
export const PLATFORM_FEES = {
    SELLER_PERCENT: 0.95,
    TRANSPORT_PERCENT: 0.03,
    PLATFORM_PERCENT: 0.02,
};
