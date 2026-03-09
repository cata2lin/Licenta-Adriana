/**
 * Profile Module — User/Company Profile Management
 * 
 * Provides endpoints for:
 * - Get own profile (user + company)
 * - Update company details (companyName, address, etc.)
 * - Update user preferences (notifications, language)
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../iam/entities/user.entity';
import { Company } from '../iam/entities/company.entity';

export class UpdateCompanyDto {
    companyName?: string;
    legalAddress?: string;
    phoneNumber?: string;
    email?: string;
    activityType?: string;
    description?: string;
}

export class UpdatePreferencesDto {
    notifEmail?: boolean;
    notifSMS?: boolean;
    notifPrices?: boolean;
    notifOrders?: boolean;
    language?: string;
    currency?: string;
}

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    ) { }

    /** Get full profile (user + company) */
    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['company'],
        });
        if (!user) throw new NotFoundException('User not found');

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            company: user.company ? {
                id: user.company.id,
                companyName: user.company.companyName,
                cui: user.company.cui,
                legalAddress: user.company.legalAddress,
                kycStatus: user.company.kycStatus,
                rating: user.company.rating,
                caenCode: user.company.caenCode,
            } : null,
            createdAt: user.createdAt,
        };
    }

    /** Update company details */
    async updateCompany(userId: string, dto: UpdateCompanyDto) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['company'] });
        if (!user) throw new NotFoundException('User not found');
        if (!user.company) throw new ForbiddenException('No company associated');

        if (dto.companyName) user.company.companyName = dto.companyName;
        if (dto.legalAddress) user.company.legalAddress = dto.legalAddress;

        const saved = await this.companyRepo.save(user.company);
        return saved;
    }

    /** Update user preferences */
    async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Return preferences — can be persisted to a JSONB column when needed
        return {
            notifEmail: dto.notifEmail ?? true,
            notifSMS: dto.notifSMS ?? false,
            notifPrices: dto.notifPrices ?? true,
            notifOrders: dto.notifOrders ?? true,
            language: dto.language ?? 'ro',
            currency: dto.currency ?? 'RON',
        };
    }
}
