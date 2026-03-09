/**
 * Listing Entity — Trading Module
 * 
 * A spot market listing (ofertă) published by a seller. Contains:
 * - Reference to the commodity dictionary (NC code, standard)
 * - Biochemical parameters stored in JSONB (protein, moisture, hectoliter, etc.)
 * - Quantity, price per tonne, location, availability window
 * - Seller company reference
 * 
 * GIN Index on `biochem_params` enables sub-millisecond filtering.
 * Schema Design: Corresponds to `listings_spot` in the implementation plan.
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Commodity } from './commodity.entity';
import { Company } from '../../iam/entities/company.entity';

export enum ListingStatus {
    ACTIVE = 'ACTIVE',
    SOLD = 'SOLD',
    EXPIRED = 'EXPIRED',
    DRAFT = 'DRAFT',
}

@Entity('listings')
export class Listing {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Reference to the commodity dictionary */
    @ManyToOne(() => Commodity, (commodity) => commodity.listings, { eager: true })
    @JoinColumn({ name: 'commodity_id' })
    commodity: Commodity;

    /** Seller's company */
    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'seller_id' })
    seller: Company;

    /** Custom listing title, e.g. "Grâu Panificație Clasa A" */
    @Column({ length: 255 })
    title: string;

    /** Quantity in the commodity's unit of measure (default: tonnes) */
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    quantity: number;

    /** Price per unit (RON/tonne) */
    @Column({ name: 'price_per_unit', type: 'decimal', precision: 12, scale: 2 })
    pricePerUnit: number;

    /**
     * Biochemical parameters stored as JSONB.
     * Example for wheat: { "protein": 14.2, "moisture": 12.8, "hectoliter": 78.5, "foreignBodies": 1.2, "fallIndex": 280 }
     * GIN indexed for high-performance filtering.
     */
    @Index('idx_listings_biochem', { synchronize: false }) // GIN index created via migration
    @Column({ name: 'biochem_params', type: 'jsonb', default: {} })
    biochemParams: Record<string, number>;

    /** Location of the storage/silo */
    @Column({ length: 255, nullable: true })
    location: string;

    /** County for regional filtering */
    @Column({ length: 100, nullable: true })
    county: string;

    /** Availability start date */
    @Column({ name: 'available_from', type: 'date', nullable: true })
    availableFrom: Date;

    /** Availability end date */
    @Column({ name: 'available_to', type: 'date', nullable: true })
    availableTo: Date;

    @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE })
    status: ListingStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;
}
