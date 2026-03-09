-- =============================================================================
-- Seed Data: Commodity Dictionary (SR EN + Nomenclator Combinat)
-- =============================================================================
-- Run this after the tables are created to populate the commodity dictionary.
-- These are the standard agricultural commodities traded on the platform.
-- =============================================================================

INSERT INTO commodities (id, name, nc_code, standard_ref, category, unit_of_measure, reverse_charge_vat, vat_rate, param_schema, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Grâu Panificație', '1001', 'SR EN 13548', 'Grâu', 'tone', TRUE, 9.00,
    '{"protein": {"min": 11.5, "max": 16.0, "unit": "%"}, "moisture": {"min": 10.0, "max": 14.5, "unit": "%"}, "hectoliter": {"min": 74.0, "max": 82.0, "unit": "kg/hl"}, "foreignBodies": {"min": 0, "max": 4.0, "unit": "%"}, "fallIndex": {"min": 220, "max": 350, "unit": "s"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Grâu Furajer', '1001', 'SR EN 13548', 'Grâu', 'tone', TRUE, 9.00,
    '{"protein": {"min": 9.0, "max": 12.5, "unit": "%"}, "moisture": {"min": 10.0, "max": 14.5, "unit": "%"}, "hectoliter": {"min": 70.0, "max": 78.0, "unit": "kg/hl"}, "foreignBodies": {"min": 0, "max": 6.0, "unit": "%"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Porumb Furajer', '1005', 'SR EN 16378', 'Porumb', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 12.0, "max": 14.5, "unit": "%"}, "hectoliter": {"min": 68.0, "max": 76.0, "unit": "kg/hl"}, "foreignBodies": {"min": 0, "max": 5.0, "unit": "%"}, "brokenGrains": {"min": 0, "max": 8.0, "unit": "%"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Porumb Alimentar', '1005', 'SR EN 16378', 'Porumb', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 12.0, "max": 14.0, "unit": "%"}, "hectoliter": {"min": 72.0, "max": 78.0, "unit": "kg/hl"}, "foreignBodies": {"min": 0, "max": 3.0, "unit": "%"}, "aflatoxins": {"min": 0, "max": 4.0, "unit": "µg/kg"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Floarea Soarelui', '1206', 'SR EN ISO 665', 'Oleaginoase', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 6.0, "max": 9.0, "unit": "%"}, "oilContent": {"min": 42.0, "max": 52.0, "unit": "%"}, "foreignBodies": {"min": 0, "max": 3.0, "unit": "%"}, "acidValue": {"min": 0, "max": 2.0, "unit": "mg KOH/g"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Floarea Soarelui HO', '1206', 'SR EN ISO 665', 'Oleaginoase', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 6.0, "max": 9.0, "unit": "%"}, "oilContent": {"min": 45.0, "max": 55.0, "unit": "%"}, "oleicAcid": {"min": 80.0, "max": 95.0, "unit": "%"}, "foreignBodies": {"min": 0, "max": 2.0, "unit": "%"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Rapiță', '1205', 'SR EN ISO 665', 'Oleaginoase', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 6.0, "max": 9.0, "unit": "%"}, "oilContent": {"min": 38.0, "max": 48.0, "unit": "%"}, "foreignBodies": {"min": 0, "max": 3.0, "unit": "%"}, "glucosinolates": {"min": 0, "max": 35.0, "unit": "µmol/g"}, "erucicAcid": {"min": 0, "max": 2.0, "unit": "%"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Orz', '1003', 'SR EN 13548', 'Orz', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 10.0, "max": 14.5, "unit": "%"}, "hectoliter": {"min": 60.0, "max": 68.0, "unit": "kg/hl"}, "protein": {"min": 9.0, "max": 14.0, "unit": "%"}, "foreignBodies": {"min": 0, "max": 4.0, "unit": "%"}}'::jsonb,
    TRUE, NOW()),

  (gen_random_uuid(), 'Soia', '1201', 'SR EN ISO 665', 'Proteaginoase', 'tone', TRUE, 9.00,
    '{"moisture": {"min": 10.0, "max": 13.0, "unit": "%"}, "protein": {"min": 32.0, "max": 42.0, "unit": "%"}, "oilContent": {"min": 17.0, "max": 22.0, "unit": "%"}, "foreignBodies": {"min": 0, "max": 3.0, "unit": "%"}}'::jsonb,
    TRUE, NOW());
