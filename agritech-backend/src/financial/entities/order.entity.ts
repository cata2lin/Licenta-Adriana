/**
 * Order Entity — Financial Module
 * 
 * Represents a bilateral commercial contract between buyer and seller.
 * Each order has an escrow lifecycle: Created → Funded → Delivered → Released.
 * 
 * The platform fee split is calculated at creation time:
 * - 95% Seller, 3% Transport, 2% Platform
 * 
 * Schema Design: Corresponds to `orders_contracts` in the implementation plan.
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Company } from '../../iam/entities/company.entity';
import { Listing } from '../../trading/entities/listing.entity';

export enum OrderStatus {
    PENDING = 'PENDING',           // Order created, waiting for escrow funding
    ESCROW_FUNDED = 'ESCROW_FUNDED', // Funds locked in escrow
    IN_TRANSIT = 'IN_TRANSIT',     // Goods dispatched (UIT allocated)
    DELIVERED = 'DELIVERED',       // Goods received by buyer
    COMPLETED = 'COMPLETED',      // Funds released to seller
    DISPUTED = 'DISPUTED',        // Quality dispute opened
    CANCELLED = 'CANCELLED',
}

export enum ContractType {
    SPOT = 'SPOT',
    FORWARD = 'FORWARD',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Human-readable order reference */
    @Column({ name: 'order_ref', length: 50, unique: true })
    orderRef: string;

    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'buyer_id' })
    buyer: Company;

    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'seller_id' })
    seller: Company;

    @ManyToOne(() => Listing, { nullable: true })
    @JoinColumn({ name: 'listing_id' })
    listing: Listing;

    @Column({ type: 'enum', enum: ContractType, default: ContractType.SPOT })
    contractType: ContractType;

    /** Product description */
    @Column({ name: 'product_description', length: 255 })
    productDescription: string;

    /** Quantity in tonnes */
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    quantity: number;

    /** Agreed price per unit (RON/t) */
    @Column({ name: 'price_per_unit', type: 'decimal', precision: 12, scale: 2 })
    pricePerUnit: number;

    /** Total order value in RON */
    @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2 })
    totalValue: number;

    /** Amount going to seller (95%) */
    @Column({ name: 'seller_amount', type: 'decimal', precision: 15, scale: 2 })
    sellerAmount: number;

    /** Amount for transport (3%) */
    @Column({ name: 'transport_amount', type: 'decimal', precision: 15, scale: 2 })
    transportAmount: number;

    /** Platform commission (2%) */
    @Column({ name: 'platform_fee', type: 'decimal', precision: 15, scale: 2 })
    platformFee: number;

    /** Whether reverse charge VAT applies (Art. 331 Cod Fiscal) */
    @Column({ name: 'reverse_charge', type: 'boolean', default: true })
    reverseCharge: boolean;

    /** VAT amount (0 if reverse charge) */
    @Column({ name: 'vat_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
    vatAmount: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    /** UIT code from RO e-Transport ANAF */
    @Column({ name: 'uit_code', length: 50, nullable: true })
    uitCode: string;

    /** Delivery date (for forward contracts) */
    @Column({ name: 'delivery_date', type: 'date', nullable: true })
    deliveryDate: Date;

    /** Notes / additional terms */
    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    @OneToMany(() => EscrowPayment, (payment) => payment.order)
    escrowPayments: EscrowPayment[];
}

/**
 * EscrowPayment Entity — Financial Module
 * 
 * Tracks individual escrow transactions (fund, release, refund)
 * for each order. Integrates with PSP (Mangopay / Libra Bank) API.
 * 
 * Schema Design: Corresponds to `escrow_payments` in the implementation plan.
 */
export enum EscrowAction {
    FUND = 'FUND',           // Initial deposit
    RELEASE = 'RELEASE',     // Release to seller after delivery
    REFUND = 'REFUND',       // Full refund to buyer
    PARTIAL_REFUND = 'PARTIAL_REFUND', // Dispute resolution partial refund
    PLATFORM_FEE = 'PLATFORM_FEE',    // Deduct platform commission
}

@Entity('escrow_payments')
export class EscrowPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.escrowPayments)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ type: 'enum', enum: EscrowAction })
    action: EscrowAction;

    /** Amount in RON */
    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    /** Source account (buyer vIBAN, escrow wallet, etc.) */
    @Column({ name: 'from_account', length: 255, nullable: true })
    fromAccount: string;

    /** Destination account (seller vIBAN, platform account, etc.) */
    @Column({ name: 'to_account', length: 255, nullable: true })
    toAccount: string;

    /** External PSP transaction ID (Mangopay / Libra Bank) */
    @Column({ name: 'psp_transaction_id', length: 255, nullable: true })
    pspTransactionId: string;

    /** Status: PENDING → COMPLETED / FAILED */
    @Column({ length: 50, default: 'PENDING' })
    paymentStatus: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
