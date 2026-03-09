/**
 * Dispute Entity — ADR Module
 * 
 * Manages quality disputes between buyers and sellers.
 * Integrates with Financial Module for hold/refund operations.
 * Implements Legea 81/2022 (Romanian ADR for commercial disputes).
 * 
 * Schema Design: Corresponds to `order_disputes` in the implementation plan.
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Order } from '../../financial/entities/order.entity';
import { Company } from '../../iam/entities/company.entity';

export enum DisputeStatus {
    OPENED = 'OPENED',           // Dispute filed, funds held
    NEGOTIATING = 'NEGOTIATING', // Parties in conciliation chat
    PROPOSAL_SENT = 'PROPOSAL_SENT', // One party proposed a resolution
    ACCEPTED = 'ACCEPTED',      // Both parties agreed
    ESCALATED = 'ESCALATED',    // Sent to external ADR mediator
    RESOLVED = 'RESOLVED',      // Refund processed
    CLOSED = 'CLOSED',          // Final state
}

export enum DisputeReason {
    QUALITY_DEVIATION = 'QUALITY_DEVIATION',     // Biochemical params mismatch
    QUANTITY_SHORTAGE = 'QUANTITY_SHORTAGE',       // Less cargo than contracted
    DELIVERY_DELAY = 'DELIVERY_DELAY',           // Late delivery
    DAMAGED_CARGO = 'DAMAGED_CARGO',             // Physical damage
    DOCUMENTATION_ISSUE = 'DOCUMENTATION_ISSUE', // Missing certificates
}

@Entity('disputes')
export class Dispute {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Human-readable dispute reference */
    @Column({ name: 'dispute_ref', length: 50, unique: true })
    disputeRef: string;

    @ManyToOne(() => Order, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    /** Who opened the dispute */
    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'complainant_id' })
    complainant: Company;

    /** Who the dispute is against */
    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'respondent_id' })
    respondent: Company;

    @Column({ type: 'enum', enum: DisputeReason })
    reason: DisputeReason;

    @Column({ type: 'text' })
    description: string;

    /** Contracted biochemical parameters (JSONB snapshot) */
    @Column({ name: 'contracted_params', type: 'jsonb', nullable: true })
    contractedParams: Record<string, number>;

    /** Received biochemical parameters (JSONB from lab analysis) */
    @Column({ name: 'received_params', type: 'jsonb', nullable: true })
    receivedParams: Record<string, number>;

    /** Amount in dispute (held in escrow) */
    @Column({ name: 'disputed_amount', type: 'decimal', precision: 15, scale: 2 })
    disputedAmount: number;

    /** Proposed refund percentage */
    @Column({ name: 'proposed_refund_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
    proposedRefundPercent: number;

    /** Actual refund amount after resolution */
    @Column({ name: 'resolved_refund', type: 'decimal', precision: 15, scale: 2, nullable: true })
    resolvedRefund: number;

    @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPENED })
    status: DisputeStatus;

    /** External ADR mediator reference (if escalated) */
    @Column({ name: 'adr_reference', length: 100, nullable: true })
    adrReference: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    @OneToMany(() => DisputeMessage, (msg) => msg.dispute)
    messages: DisputeMessage[];
}

/**
 * DisputeMessage Entity — Chat for Conciliation (Legea 81/2022)
 */
@Entity('dispute_messages')
export class DisputeMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Dispute, (dispute) => dispute.messages)
    @JoinColumn({ name: 'dispute_id' })
    dispute: Dispute;

    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'sender_id' })
    sender: Company;

    @Column({ type: 'text' })
    content: string;

    /** System-generated messages (e.g., "Proposal sent", "Refund processed") */
    @Column({ name: 'is_system', type: 'boolean', default: false })
    isSystem: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
