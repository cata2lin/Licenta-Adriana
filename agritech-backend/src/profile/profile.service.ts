/**
 * Profile Module — User/Company Profile Management + Reviews
 * 
 * Provides endpoints for:
 * - Get own profile (user + company)
 * - Update company details (companyName, address, etc.)
 * - Update user preferences (notifications, language)
 * - CRUD Reviews with automatic rating recalculation
 */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../iam/entities/user.entity';
import { Company } from '../iam/entities/company.entity';
import { Review } from './entities/review.entity';

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

export class CreateReviewDto {
    /** UUID of the company being reviewed */
    companyId: string;
    /** Star rating 1-5 */
    rating: number;
    /** Public review message */
    message: string;
    /** Private notes (optional) */
    notes?: string;
    /** Order reference (optional) */
    orderRef?: string;
}

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
        @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    ) { }

    /** Get full profile (user + company) */
    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['company'],
        });
        if (!user) throw new NotFoundException('User not found');

        // Get review stats for the user's company
        let reviewStats = { count: 0, average: 0 };
        if (user.company) {
            reviewStats = await this.getCompanyReviewStats(user.company.id);
        }

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
                reviewCount: reviewStats.count,
                averageRating: reviewStats.average,
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

    // ─── Review Methods ───

    /** Create a new review and recalculate the company's average rating */
    async createReview(userId: string, dto: CreateReviewDto) {
        if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }
        if (!dto.message || dto.message.trim().length === 0) {
            throw new BadRequestException('Review message is required');
        }

        const reviewer = await this.userRepo.findOne({ where: { id: userId } });
        if (!reviewer) throw new NotFoundException('User not found');

        const company = await this.companyRepo.findOne({ where: { id: dto.companyId } });
        if (!company) throw new NotFoundException('Company not found');

        const review = this.reviewRepo.create({
            reviewedCompany: company,
            reviewer: reviewer,
            rating: Math.round(dto.rating),
            message: dto.message.trim(),
            notes: dto.notes?.trim() || null,
            orderRef: dto.orderRef || null,
        });

        const saved = await this.reviewRepo.save(review);

        // Recalculate the company's average rating
        await this.recalculateCompanyRating(dto.companyId);

        return {
            id: saved.id,
            rating: saved.rating,
            message: saved.message,
            notes: saved.notes,
            orderRef: saved.orderRef,
            reviewerName: reviewer.fullName,
            createdAt: saved.createdAt,
        };
    }

    /** Get all reviews for a company */
    async getCompanyReviews(companyId: string) {
        const reviews = await this.reviewRepo.find({
            where: { reviewedCompany: { id: companyId } },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
        });

        const stats = await this.getCompanyReviewStats(companyId);

        return {
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                message: r.message,
                orderRef: r.orderRef,
                reviewerName: r.reviewer?.fullName || 'Anonim',
                createdAt: r.createdAt,
            })),
            stats,
        };
    }

    /** Compute average rating and count for a company */
    private async getCompanyReviewStats(companyId: string): Promise<{ count: number; average: number; distribution: Record<number, number> }> {
        const reviews = await this.reviewRepo.find({
            where: { reviewedCompany: { id: companyId } },
        });

        if (reviews.length === 0) {
            return { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let total = 0;
        for (const r of reviews) {
            total += r.rating;
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        }

        return {
            count: reviews.length,
            average: Math.round((total / reviews.length) * 100) / 100,
            distribution,
        };
    }

    /** Recalculate and persist the company's average rating */
    private async recalculateCompanyRating(companyId: string) {
        const stats = await this.getCompanyReviewStats(companyId);
        await this.companyRepo.update(companyId, { rating: stats.average });
    }

    /** Delete a review (only by the original reviewer) */
    async deleteReview(userId: string, reviewId: string) {
        const review = await this.reviewRepo.findOne({
            where: { id: reviewId },
            relations: ['reviewer', 'reviewedCompany'],
        });
        if (!review) throw new NotFoundException('Review not found');
        if (review.reviewer.id !== userId) throw new ForbiddenException('You can only delete your own reviews');

        const companyId = review.reviewedCompany.id;
        await this.reviewRepo.remove(review);

        // Recalculate after deletion
        await this.recalculateCompanyRating(companyId);

        return { message: 'Review deleted' };
    }
}
