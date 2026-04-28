/**
 * Profile Controller — REST API for User/Company Profile + Reviews
 * 
 * Endpoints:
 * - GET    /profile              → Get own profile
 * - PATCH  /profile/company      → Update company details
 * - PATCH  /profile/prefs        → Update user preferences
 * - POST   /profile/reviews      → Create a review
 * - GET    /profile/reviews/:companyId → Get reviews for a company
 * - DELETE /profile/reviews/:id  → Delete own review
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProfileService, UpdateCompanyDto, UpdatePreferencesDto, CreateReviewDto } from './profile.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    async getProfile(@Request() req: any) {
        return this.profileService.getProfile(req.user.sub);
    }

    @Patch('company')
    async updateCompany(@Request() req: any, @Body() dto: UpdateCompanyDto) {
        return this.profileService.updateCompany(req.user.sub, dto);
    }

    @Patch('prefs')
    async updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
        return this.profileService.updatePreferences(req.user.sub, dto);
    }

    // ─── Review Endpoints ───

    @Post('reviews')
    async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
        return this.profileService.createReview(req.user.sub, dto);
    }

    @Get('reviews/:companyId')
    async getCompanyReviews(@Param('companyId') companyId: string) {
        return this.profileService.getCompanyReviews(companyId);
    }

    @Delete('reviews/:id')
    async deleteReview(@Request() req: any, @Param('id') id: string) {
        return this.profileService.deleteReview(req.user.sub, id);
    }
}
