/**
 * Disputes Controller — REST API for Quality Disputes & ADR
 * 
 * Endpoints:
 * - POST   /disputes                      — Open dispute (Auth)
 * - GET    /disputes                      — List disputes (Auth)
 * - GET    /disputes/:id                  — Get dispute details (Auth)
 * 
 * - POST   /disputes/:id/messages         — Send chat message (Auth, parties only)
 * - GET    /disputes/:id/messages         — Get chat history (Auth, parties only)
 * 
 * - POST   /disputes/:id/propose          — Propose resolution (Auth)
 * - POST   /disputes/:id/accept           — Accept resolution (Auth)
 * - POST   /disputes/:id/escalate         — Escalate to ADR (Auth)
 * 
 * - GET    /disputes/stats                — Dispute statistics (Admin)
 */
import {
    Controller, Get, Post,
    Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { OpenDisputeDto, SendMessageDto, ProposeResolutionDto, AcceptResolutionDto } from './dto/disputes.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';

@Controller('disputes')
export class DisputesController {
    constructor(private readonly disputesService: DisputesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async openDispute(@Body() dto: OpenDisputeDto, @Request() req) {
        return this.disputesService.openDispute(dto, req.user.companyId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findDisputes(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
        if (req.user.role === 'ADMIN') {
            return this.disputesService.findAllDisputes(page || 1, limit || 20);
        }
        return this.disputesService.findDisputesByCompany(req.user.companyId);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getStats() {
        return this.disputesService.getStats();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findDisputeById(@Param('id') id: string) {
        return this.disputesService.findDisputeById(id);
    }

    // ─── Chat ───

    @Post(':id/messages')
    @UseGuards(JwtAuthGuard)
    async sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @Request() req) {
        return this.disputesService.sendMessage(id, req.user.companyId, dto);
    }

    @Get(':id/messages')
    @UseGuards(JwtAuthGuard)
    async getMessages(@Param('id') id: string) {
        return this.disputesService.getMessages(id);
    }

    // ─── Resolution ───

    @Post(':id/propose')
    @UseGuards(JwtAuthGuard)
    async proposeResolution(@Param('id') id: string, @Body() dto: ProposeResolutionDto, @Request() req) {
        return this.disputesService.proposeResolution(id, req.user.companyId, dto);
    }

    @Post(':id/accept')
    @UseGuards(JwtAuthGuard)
    async acceptResolution(@Param('id') id: string, @Request() req) {
        return this.disputesService.acceptResolution(id, req.user.companyId);
    }

    @Post(':id/escalate')
    @UseGuards(JwtAuthGuard)
    async escalateToADR(@Param('id') id: string) {
        return this.disputesService.escalateToADR(id);
    }
}
