import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

export enum UserRole {
    FARMER = 'FARMER',
    CORPORATE_BUYER = 'CORPORATE_BUYER',
    TRANSPORTER = 'TRANSPORTER',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Company, (company) => company.users, { nullable: true })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @Column({ name: 'full_name', length: 255 })
    fullName: string;

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ name: 'phone_number', length: 50, nullable: true })
    phoneNumber: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
