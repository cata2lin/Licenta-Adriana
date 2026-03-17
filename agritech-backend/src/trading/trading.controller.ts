/**
 * Trading Controller — REST API for Commodities & Listings
 * 
 * Endpoints:
 * - POST   /trading/commodities     — Create commodity (Admin only)
 * - GET    /trading/commodities     — List all commodities
 * - PATCH  /trading/commodities/:id — Update commodity (Admin only)
 * - DELETE /trading/commodities/:id — Deactivate commodity (Admin only)
 * 
 * - POST   /trading/listings        — Create listing (Auth required)
 * - GET    /trading/listings        — Search listings (public)
 * - GET    /trading/listings/mine   — My listings (Auth required)
 * - GET    /trading/listings/:id    — Get listing by ID (public)
 * - PATCH  /trading/listings/:id    — Update listing (Owner only)
 * - DELETE /trading/listings/:id    — Delete listing (Owner only)
 * 
 * Guards: JwtAuthGuard, RolesGuard
 * Modular: Does NOT import from Financial, Transport, or Dispute modules.
 */
import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards, Request,
    HttpCode, HttpStatus,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import {
    CreateCommodityDto, UpdateCommodityDto,
    CreateListingDto, UpdateListingDto, SearchListingsDto,
} from './dto/trading.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '../iam/entities/user.entity';

@Controller('trading')
export class TradingController {
    constructor(private readonly tradingService: TradingService) { }

    // ─── Commodity Endpoints (Admin Only) ───

    @Post('commodities')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async createCommodity(@Body() dto: CreateCommodityDto) {
        return this.tradingService.createCommodity(dto);
    }

    @Get('commodities')
    async findAllCommodities() {
        return this.tradingService.findAllCommodities();
    }

    @Patch('commodities/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateCommodity(@Param('id') id: string, @Body() dto: UpdateCommodityDto) {
        return this.tradingService.updateCommodity(id, dto);
    }

    @Delete('commodities/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deactivateCommodity(@Param('id') id: string) {
        return this.tradingService.deactivateCommodity(id);
    }

    // ─── Listing Endpoints ───

    @Post('listings')
    @UseGuards(JwtAuthGuard)
    async createListing(@Body() dto: CreateListingDto, @Request() req) {
        const companyId = req.user.companyId;
        return this.tradingService.createListing(dto, companyId);
    }

    @Get('listings')
    async searchListings(@Query() dto: SearchListingsDto) {
        return this.tradingService.searchListings(dto);
    }

    @Get('listings/mine')
    @UseGuards(JwtAuthGuard)
    async findMyListings(@Request() req) {
        return this.tradingService.findMyListings(req.user.companyId);
    }

    @Get('listings/:id')
    async findListingById(@Param('id') id: string) {
        return this.tradingService.findListingById(id);
    }

    @Patch('listings/:id')
    @UseGuards(JwtAuthGuard)
    async updateListing(@Param('id') id: string, @Body() dto: UpdateListingDto, @Request() req) {
        return this.tradingService.updateListing(id, dto, req.user.companyId);
    }

    @Delete('listings/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteListing(@Param('id') id: string, @Request() req) {
        return this.tradingService.deleteListing(id, req.user.companyId);
    }
}
