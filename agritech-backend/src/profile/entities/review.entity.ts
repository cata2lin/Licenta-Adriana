/**
 * Review Entity — Profile Module
 * 
 * Represents a review left by one company for another after completing a transaction.
 * Each review includes:
 * - Star rating (1-5)
 * - Text message (feedback)
 * - Optional notes (private context)
 * - Reference to the order that triggered the review
 * 
 * The company's aggregate rating is recalculated after each new review.
 */
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Company } from '../../iam/entities/company.entity';
import { User } from '../../iam/entities/user.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** The company being reviewed */
    @ManyToOne(() => Company, { eager: true })
    @JoinColumn({ name: 'reviewed_company_id' })
    reviewedCompany: Company;

    /** The user who wrote the review */
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;

    /** Star rating: 1-5 */
    @Column({ type: 'smallint' })
    rating: number;

    /** Public review message */
    @Column({ type: 'text' })
    message: string;

    /** Private notes (visible only to the reviewer) */
    @Column({ type: 'text', nullable: true })
    notes: string;

    /** Reference to the order/contract this review is about */
    @Column({ name: 'order_ref', length: 100, nullable: true })
    orderRef: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
