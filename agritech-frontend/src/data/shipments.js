/**
 * Mock shipments data for the Logistics Module.
 * In production, fetched from the Transport Module API.
 */
export const MOCK_SHIPMENTS = [
    { id: 1, route: 'Constanța → București', dist: '225 km', cargo: 'Grâu Panificație — 24t (Basculantă)', transporter: 'SC TRANS RAPID SRL', risk: '4.7/5', status: 'În drum', uit: 'RO24T-0001', eta: '3h 15min', costOwn: 1350, costMarket: 1125 },
    { id: 2, route: 'Brăila → Buzău', dist: '120 km', cargo: 'Porumb Furajer — 24t', transporter: 'SC EURO CARGO SRL', risk: '4.5/5', status: 'Programat', uit: 'RO24T-0002', eta: '6h', costOwn: 720, costMarket: 600 },
    { id: 3, route: 'Timiș → Cluj-Napoca', dist: '310 km', cargo: 'Fl. Soarelui — 24t', transporter: 'SC VEST TRANS SRL', risk: '4.8/5', status: 'În drum', uit: 'RO24T-0004', eta: '5h 40min', costOwn: 1860, costMarket: 1550 },
];

/** Mock forward contracts */
export const MOCK_FORWARD_CONTRACTS = [
    { id: 'FWD-2024-001', commodity: 'Grâu Panificație', qty: 500, price: 1180, deliveryDate: '2024-09-15', buyer: 'SC MORAR SRL', status: 'Activ', deposit: 59000 },
    { id: 'FWD-2024-002', commodity: 'Porumb Furajer', qty: 300, price: 950, deliveryDate: '2024-10-01', buyer: 'SC FEED RO SRL', status: 'Activ', deposit: 28500 },
    { id: 'FWD-2024-003', commodity: 'Fl. Soarelui HO', qty: 200, price: 2050, deliveryDate: '2024-08-20', buyer: 'SC OIL PRESS SRL', status: 'Expirat', deposit: 41000 },
];
