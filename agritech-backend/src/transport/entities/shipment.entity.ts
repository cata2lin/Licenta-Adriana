/**
 * Shipment Entity — Transport Module
 * 
 * Tracks freight movements between origin and destination.
 * Integrates with:
 * - OSRM routing engine for real distances (heavy vehicle profiles)
 * - RO e-Transport ANAF for UIT code allocation
 * - 123cargo (Alpega Group) for transport bidding
 * 
 * Schema Design: Corresponds to `shipments` in the implementation plan.
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Company } from '../../iam/entities/company.entity';
import { Order } from '../../financial/entities/order.entity';

export enum ShipmentStatus {
    PLANNED = 'PLANNED',       // Route calculated, no transporter assigned
    BIDDING = 'BIDDING',       // Posted to 123cargo, awaiting bids
    ASSIGNED = 'ASSIGNED',     // Transporter selected
    IN_TRANSIT = 'IN_TRANSIT', // On the road, UIT allocated
    DELIVERED = 'DELIVERED',   // Cargo received at destination
    CANCELLED = 'CANCELLED',
}

@Entity('shipments')
export class Shipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Human-readable shipment reference */
    @Column({ name: 'shipment_ref', length: 50, unique: true })
    shipmentRef: string;

    /** Associated order */
    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    /** Transporter company (null until assigned) */
    @ManyToOne(() => Company, { nullable: true, eager: true })
    @JoinColumn({ name: 'transporter_id' })
    transporter: Company;

    // ─── Route Information (OSRM) ───

    @Column({ name: 'origin_address', length: 255 })
    originAddress: string;

    @Column({ name: 'origin_county', length: 100, nullable: true })
    originCounty: string;

    @Column({ name: 'origin_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    originLat: number;

    @Column({ name: 'origin_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    originLng: number;

    @Column({ name: 'dest_address', length: 255 })
    destAddress: string;

    @Column({ name: 'dest_county', length: 100, nullable: true })
    destCounty: string;

    @Column({ name: 'dest_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    destLat: number;

    @Column({ name: 'dest_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    destLng: number;

    /** Distance in km (calculated by OSRM) */
    @Column({ name: 'distance_km', type: 'decimal', precision: 8, scale: 2 })
    distanceKm: number;

    /** Estimated duration in minutes (OSRM) */
    @Column({ name: 'duration_min', type: 'integer', nullable: true })
    durationMin: number;

    // ─── Cargo Information ───

    @Column({ name: 'cargo_description', length: 255 })
    cargoDescription: string;

    /** Weight in tonnes */
    @Column({ name: 'weight_tonnes', type: 'decimal', precision: 8, scale: 2 })
    weightTonnes: number;

    /** Vehicle type requirement */
    @Column({ name: 'vehicle_type', length: 100, default: 'Basculantă 24t' })
    vehicleType: string;

    // ─── Costs ───

    /** Cost per km (RON) */
    @Column({ name: 'rate_per_km', type: 'decimal', precision: 8, scale: 2 })
    ratePerKm: number;

    /** Total transport cost (RON) */
    @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 })
    totalCost: number;

    // ─── Compliance ───

    /** RO e-Transport ANAF UIT code */
    @Column({ name: 'uit_code', length: 50, nullable: true })
    uitCode: string;

    /** 123cargo bid ID (external) */
    @Column({ name: 'cargo_bid_id', length: 100, nullable: true })
    cargoBidId: string;

    /** Transporter risk score from 123cargo */
    @Column({ name: 'transporter_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
    transporterScore: number;

    @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PLANNED })
    status: ShipmentStatus;

    /** Scheduled pickup date */
    @Column({ name: 'pickup_date', type: 'date', nullable: true })
    pickupDate: Date;

    /** Actual delivery date */
    @Column({ name: 'delivery_date', type: 'date', nullable: true })
    deliveryDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;
}
