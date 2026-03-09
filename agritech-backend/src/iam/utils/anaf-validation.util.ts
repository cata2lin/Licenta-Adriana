/**
 * ANAF CUI Validation Utility
 * 
 * Enhanced mock of the Romanian ANAF/VIES API for company validation.
 * In production: calls https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva
 * 
 * Returns:
 * - Company name, registered address, CUI validity
 * - VAT payer status (for reverse charge determination)
 * - CAEN codes
 * - Activity status (active/inactive/suspended)
 */

export interface AnafCompanyInfo {
    cui: string;
    name: string;
    address: string;
    isVatPayer: boolean;
    isActive: boolean;
    caenCode: string;
    registrationDate: string;
}

/** Mock ANAF database — real implementation calls the REST API */
const MOCK_ANAF_DB: Record<string, AnafCompanyInfo> = {
    'RO12345678': { cui: 'RO12345678', name: 'SC AGRO ION SRL', address: 'Str. Recoltei 5, Constanța', isVatPayer: true, isActive: true, caenCode: '0111', registrationDate: '2015-03-15' },
    'RO87654321': { cui: 'RO87654321', name: 'SC MORAR CEREALE SA', address: 'Bd. Independenței 22, București', isVatPayer: true, isActive: true, caenCode: '1061', registrationDate: '2010-07-01' },
    'RO11223344': { cui: 'RO11223344', name: 'SC TRANSPORT AGRI SRL', address: 'Calea Moldovei 10, Iași', isVatPayer: true, isActive: true, caenCode: '4941', registrationDate: '2018-11-20' },
    'RO99887766': { cui: 'RO99887766', name: 'SC OLEIFICIO ROMANIA SRL', address: 'Str. Fabricii 3, Timișoara', isVatPayer: true, isActive: true, caenCode: '1041', registrationDate: '2012-06-10' },
    'RO55667788': { cui: 'RO55667788', name: 'FERMA VERDE SRL', address: 'Sat Mărgineni, Dolj', isVatPayer: false, isActive: true, caenCode: '0111', registrationDate: '2020-01-05' },
};

/**
 * Validate a CUI against ANAF/VIES (mock implementation).
 * In production, replace with HTTP POST to ANAF REST API.
 */
export async function validateAnafCui(cui: string): Promise<{ valid: boolean; company?: AnafCompanyInfo }> {
    // Normalize CUI: strip 'RO' prefix for length check, then add it back
    const normalizedCui = cui.toUpperCase().startsWith('RO') ? cui.toUpperCase() : `RO${cui}`;

    if (normalizedCui.replace('RO', '').length < 5) {
        return { valid: false };
    }

    // Check mock database
    const company = MOCK_ANAF_DB[normalizedCui];
    if (company) {
        return { valid: company.isActive, company };
    }

    // For unknown CUIs, simulate a successful validation (mock only)
    return {
        valid: true,
        company: {
            cui: normalizedCui,
            name: `Companie ${normalizedCui}`,
            address: 'Adresă necunoscută',
            isVatPayer: true,
            isActive: true,
            caenCode: '4611',
            registrationDate: new Date().toISOString().split('T')[0],
        },
    };
}

/**
 * Check if reverse charge VAT applies for a transaction between two companies.
 * Art. 331 Cod Fiscal: Both must be VAT payers for eligible commodities.
 */
export function shouldApplyReverseCharge(sellerInfo: AnafCompanyInfo, buyerInfo: AnafCompanyInfo, ncCode: string): boolean {
    // Both must be VAT payers
    if (!sellerInfo.isVatPayer || !buyerInfo.isVatPayer) return false;

    // Eligible NC codes for reverse charge (cereals, oilseeds, sugar beet)
    const eligibleCodes = ['1001', '1002', '1003', '1004', '1005', '1201', '1205', '1206', '1207', '1212'];
    return eligibleCodes.includes(ncCode);
}
