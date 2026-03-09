/**
 * Mock listings data for the Spot Market.
 * In production, this will be fetched from the Trading Module API.
 * Each listing follows the commodities_dictionary + listings schema.
 */
export const MOCK_LISTINGS = [
    { id: 1, name: 'Grâu Panificație Clasa A', type: 'Grâu', protein: 14.2, moisture: 12.8, hectoliter: 78.5, foreignBodies: 1.2, fallIndex: 280, qty: 120, price: 1250, seller: 'SC AGRO ION SRL', rating: 4.8, loc: 'Constanța', dist: '45 km', standard: 'SR EN 13548', ncCode: '1001' },
    { id: 2, name: 'Porumb Furajer', type: 'Porumb', protein: 9.5, moisture: 13.5, hectoliter: 72, foreignBodies: 2.0, fallIndex: 0, qty: 85, price: 980, seller: 'SC CEREALCOM SRL', rating: 4.5, loc: 'Brăila', dist: '120 km', standard: 'SR EN 15948', ncCode: '1005' },
    { id: 3, name: 'Floarea Soarelui HO', type: 'Fl. Soarelui', protein: 0, moisture: 8.2, hectoliter: 0, foreignBodies: 1.5, fallIndex: 0, qty: 200, price: 2100, seller: 'SC AGRO VEST SRL', rating: 4.9, loc: 'Timiș', dist: '380 km', standard: 'SR EN 16378', ncCode: '1206' },
    { id: 4, name: 'Rapiță 00', type: 'Rapiță', protein: 0, moisture: 7.8, hectoliter: 0, foreignBodies: 1.0, fallIndex: 0, qty: 60, price: 2350, seller: 'SC DELTA AGRO SRL', rating: 4.3, loc: 'Tulcea', dist: '200 km', standard: 'SR EN 16378', ncCode: '1205' },
    { id: 5, name: 'Grâu Panificație Clasa B', type: 'Grâu', protein: 12.1, moisture: 13.0, hectoliter: 76.0, foreignBodies: 1.8, fallIndex: 250, qty: 300, price: 1180, seller: 'SC DUNĂREA AGRI SRL', rating: 4.6, loc: 'Călărași', dist: '90 km', standard: 'SR EN 13548', ncCode: '1001' },
    { id: 6, name: 'Orz pentru bere', type: 'Orz', protein: 11.8, moisture: 12.5, hectoliter: 68, foreignBodies: 1.3, fallIndex: 0, qty: 50, price: 1050, seller: 'SC MALTCOM SRL', rating: 4.7, loc: 'Iași', dist: '310 km', standard: 'SR EN 14932', ncCode: '1003' },
];

/** Commodity types available for filtering */
export const COMMODITY_TYPES = ['Grâu', 'Porumb', 'Fl. Soarelui', 'Rapiță', 'Orz'];

/** Commodity metadata map for the Create Listing form */
export const COMMODITY_MAP = {
    'Grâu Panificație': { ncCode: '1001', standard: 'SR EN 13548', type: 'Grâu' },
    'Porumb Furajer': { ncCode: '1005', standard: 'SR EN 15948', type: 'Porumb' },
    'Floarea Soarelui': { ncCode: '1206', standard: 'SR EN 16378', type: 'Fl. Soarelui' },
    'Rapiță': { ncCode: '1205', standard: 'SR EN 16378', type: 'Rapiță' },
    'Orz': { ncCode: '1003', standard: 'SR EN 14932', type: 'Orz' },
};
