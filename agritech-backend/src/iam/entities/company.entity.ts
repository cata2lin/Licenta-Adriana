import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum KycStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    cui: string;

    @Column({ name: 'company_name', length: 255 })
    companyName: string;

    @Column({ name: 'legal_address', type: 'text' })
    legalAddress: string;

    @Column({ length: 50, nullable: true })
    iban: string;

    @Column({ name: 'bank_name', length: 100, nullable: true })
    bankName: string;

    @Column({ name: 'caen_code', length: 10, default: '4611' })
    caenCode: string;

    @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING, name: 'kyc_status' })
    kycStatus: KycStatus;

    @Column({ name: 'psp_wallet_id', length: 255, nullable: true })
    pspWalletId: string;

    @Column({ name: 'psp_viban', length: 50, nullable: true })
    pspViban: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
    rating: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @OneToMany(() => User, (user) => user.company)
    users: User[];
}
