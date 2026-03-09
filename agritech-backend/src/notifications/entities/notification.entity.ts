/**
 * Notification Entity — Platform Notifications
 * 
 * Stores persistent notifications for users:
 * - Order status changes, escrow events
 * - Dispute updates, ADR escalation
 * - Price alerts, new listings matching criteria
 * - KYC/KYB status changes
 * - DAC7 reports generated
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../iam/entities/user.entity';

export enum NotificationType {
    ORDER_STATUS = 'ORDER_STATUS',
    ESCROW_EVENT = 'ESCROW_EVENT',
    DISPUTE_UPDATE = 'DISPUTE_UPDATE',
    PRICE_ALERT = 'PRICE_ALERT',
    KYC_STATUS = 'KYC_STATUS',
    SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
    type: NotificationType;

    @Column({ length: 500 })
    message: string;

    /** Optional reference to related entity (orderId, disputeId, etc.) */
    @Column({ name: 'reference_id', length: 100, nullable: true })
    referenceId: string;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
