/**
 * Forward Contract Entity
 * 
 * Implements bilateral physical delivery contracts (NOT financial instruments).
 * The platform acts as CAEN 4611 intermediary, not a commodities exchange.
 * 
 * Features:
 * - Fixed price for future delivery
 * - 10% advance deposit blocked in Escrow
 * - Delivery schedule with penalty clauses
 * - Linked to financial Order for payment processing
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Company } from '../../iam/entities/company.entity';
import { Commodity } from './commodity.entity';

export enum ForwardContractStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    DEPOSIT_ESCROWED = 'DEPOSIT_ESCROWED',
    DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED',
}

@Entity('forward_contracts')
export class ForwardContract {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Human-readable contract ID */
    @Column({ name: 'contract_code', length: 50, unique: true })
    contractCode: string;

    @ManyToOne(() => Commodity)
    @JoinColumn({ name: 'commodity_id' })
    commodity: Commodity;

    @Column({ name: 'commodity_name', length: 255 })
    commodityName: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'seller_id' })
    seller: Company;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'buyer_id' })
    buyer: Company;

    @Column({ name: 'buyer_name', length: 255, nullable: true })
    buyerName: string;

    /** Quantity in metric tons */
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    quantity: number;

    /** Fixed price per ton (RON) */
    @Column({ name: 'price_per_ton', type: 'decimal', precision: 12, scale: 2 })
    pricePerTon: number;

    /** Total contract value = quantity × pricePerTon */
    @Column({ name: 'total_value', type: 'decimal', precision: 14, scale: 2 })
    totalValue: number;

    /** 10% advance deposit locked in Escrow */
    @Column({ name: 'deposit_amount', type: 'decimal', precision: 14, scale: 2 })
    depositAmount: number;

    /** Agreed delivery date */
    @Column({ name: 'delivery_date', type: 'date' })
    deliveryDate: Date;

    @Column({ type: 'enum', enum: ForwardContractStatus, default: ForwardContractStatus.DRAFT })
    status: ForwardContractStatus;

    /** Whether reverse charge VAT applies (Art. 331 Cod Fiscal) */
    @Column({ name: 'reverse_charge_vat', type: 'boolean', default: true })
    reverseChargeVat: boolean;

    /** Reference to related escrow order */
    @Column({ name: 'escrow_order_id', length: 100, nullable: true })
    escrowOrderId: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
