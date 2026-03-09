/**
 * Profile Controller — REST API for User/Company Profile
 * 
 * Endpoints:
 * - GET    /profile         → Get own profile
 * - PATCH  /profile/company → Update company details
 * - PATCH  /profile/prefs   → Update user preferences
 */
import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ProfileService, UpdateCompanyDto, UpdatePreferencesDto } from './profile.service';
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
}
