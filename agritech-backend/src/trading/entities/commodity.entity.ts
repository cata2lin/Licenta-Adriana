/**
 * Commodity Entity — Trading Module
 * 
 * Defines the standardized commodity dictionary (SR EN + Nomenclator Combinat).
 * Each commodity has a fixed NC code, standard, and set of expected biochemical params.
 * This entity is managed by ADMINs only. Users reference it when creating listings.
 * 
 * Schema Design: Corresponds to `commodities_dictionary` in the implementation plan.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './listing.entity';

@Entity('commodities')
export class Commodity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Common display name, e.g. "Grâu Panificație" */
    @Column({ length: 255 })
    name: string;

    /** Nomenclator Combinat code, e.g. "1001" for wheat */
    @Column({ name: 'nc_code', length: 20 })
    ncCode: string;

    /** European standard reference, e.g. "SR EN 13548" */
    @Column({ name: 'standard_ref', length: 100 })
    standardRef: string;

    /** Commodity category for filtering, e.g. "Grâu", "Porumb" */
    @Column({ length: 100 })
    category: string;

    /** Unit of measurement, e.g. "tone" */
    @Column({ name: 'unit_of_measure', length: 50, default: 'tone' })
    unitOfMeasure: string;

    /** Whether reverse charge VAT is applicable (Art. 331 Cod Fiscal) */
    @Column({ name: 'reverse_charge_vat', type: 'boolean', default: true })
    reverseChargeVat: boolean;

    /** Standard VAT rate when reverse charge doesn't apply */
    @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 9.00 })
    vatRate: number;

    /** JSON schema defining expected biochemical parameters for this commodity */
    @Column({ name: 'param_schema', type: 'jsonb', nullable: true })
    paramSchema: Record<string, any>;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @OneToMany(() => Listing, (listing) => listing.commodity)
    listings: Listing[];
}
