/**
 * Transport Controller — REST API for Shipping & Routing
 * 
 * Endpoints:
 * - POST   /transport/shipments           — Create shipment (Auth)
 * - GET    /transport/shipments           — List shipments (Auth)
 * - GET    /transport/shipments/:id       — Get shipment details (Auth)
 * - PATCH  /transport/shipments/:id/status — Update status (Auth)
 * - POST   /transport/shipments/:id/assign — Assign transporter (Auth)
 * 
 * - POST   /transport/route/calculate     — Calculate OSRM route (Auth)
 * - POST   /transport/bidding/:id         — Simulate 123cargo bidding (Auth)
 * 
 * - GET    /transport/stats               — Transport statistics (Admin)
 */
import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import {
    CreateShipmentDto, CalculateRouteDto,
    UpdateShipmentStatusDto, AssignTransporterDto,
} from './dto/transport.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '../iam/entities/user.entity';

@Controller('transport')
export class TransportController {
    constructor(private readonly transportService: TransportService) { }

    // ─── Shipment Endpoints ───

    @Post('shipments')
    @UseGuards(JwtAuthGuard)
    async createShipment(@Body() dto: CreateShipmentDto) {
        return this.transportService.createShipment(dto);
    }

    @Get('shipments')
    @UseGuards(JwtAuthGuard)
    async findAllShipments(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.transportService.findAllShipments(page || 1, limit || 20);
    }

    @Get('shipments/:id')
    @UseGuards(JwtAuthGuard)
    async findShipmentById(@Param('id') id: string) {
        return this.transportService.findShipmentById(id);
    }

    @Patch('shipments/:id/status')
    @UseGuards(JwtAuthGuard)
    async updateShipmentStatus(@Param('id') id: string, @Body() dto: UpdateShipmentStatusDto) {
        return this.transportService.updateShipmentStatus(id, dto);
    }

    @Post('shipments/:id/assign')
    @UseGuards(JwtAuthGuard)
    async assignTransporter(@Param('id') id: string, @Body() dto: AssignTransporterDto) {
        return this.transportService.assignTransporter(id, dto);
    }

    // ─── Routing & Bidding ───

    @Post('route/calculate')
    @UseGuards(JwtAuthGuard)
    async calculateRoute(@Body() dto: CalculateRouteDto) {
        return this.transportService.calculateRoute(dto);
    }

    @Post('bidding/:id')
    @UseGuards(JwtAuthGuard)
    async simulateBidding(@Param('id') id: string) {
        return this.transportService.simulateCargoBidding(id);
    }

    // ─── Stats ───

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getStats() {
        return this.transportService.getStats();
    }
}
