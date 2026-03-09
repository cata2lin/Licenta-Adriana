/**
 * Financial Controller — REST API for Orders, Escrow, DAC7 & Chargeback
 * 
 * Endpoints:
 * - POST   /financial/orders           — Create order
 * - GET    /financial/orders           — List orders
 * - GET    /financial/orders/:id       — Get order by ID
 * - PATCH  /financial/orders/:id/status — Update status
 * - POST   /financial/escrow/:id/fund     — Fund escrow
 * - POST   /financial/escrow/:id/release  — Release escrow
 * - POST   /financial/escrow/:id/refund   — Process refund
 * - GET    /financial/stats            — Platform statistics
 * - POST   /financial/dac7/generate    — Generate DAC7 F7000 report
 * - POST   /financial/chargeback/:id   — Route chargeback to liable account
 */
import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { DAC7Service } from './dac7.service';
import { CreateOrderDto, UpdateOrderStatusDto, ProcessRefundDto } from './dto/financial.dto';
import { GenerateDAC7Dto } from './dto/generate-dac7.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '../iam/entities/user.entity';

@Controller('financial')
export class FinancialController {
    constructor(
        private readonly financialService: FinancialService,
        private readonly dac7Service: DAC7Service,
    ) { }

    // ─── Order Endpoints ───

    @Post('orders')
    @UseGuards(JwtAuthGuard)
    async createOrder(@Body() dto: CreateOrderDto) {
        return this.financialService.createOrder(dto);
    }

    @Get('orders')
    @UseGuards(JwtAuthGuard)
    async findOrders(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
        if (req.user.role === 'ADMIN') {
            return this.financialService.findAllOrders(page || 1, limit || 20);
        }
        return this.financialService.findOrdersByCompany(req.user.companyId);
    }

    @Get('orders/:id')
    @UseGuards(JwtAuthGuard)
    async findOrderById(@Param('id') id: string) {
        return this.financialService.findOrderById(id);
    }

    @Patch('orders/:id/status')
    @UseGuards(JwtAuthGuard)
    async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.financialService.updateOrderStatus(id, dto);
    }

    // ─── Escrow Endpoints ───

    @Post('escrow/:id/fund')
    @UseGuards(JwtAuthGuard)
    async fundEscrow(@Param('id') id: string) {
        return this.financialService.fundEscrow(id);
    }

    @Post('escrow/:id/release')
    @UseGuards(JwtAuthGuard)
    async releaseEscrow(@Param('id') id: string) {
        return this.financialService.releaseEscrow(id);
    }

    @Post('escrow/:id/refund')
    @UseGuards(JwtAuthGuard)
    async processRefund(@Param('id') id: string, @Body() dto: ProcessRefundDto) {
        return this.financialService.processRefund(id, dto);
    }

    // ─── Admin Stats ───

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getStats() {
        return this.financialService.getStats();
    }

    // ─── DAC7 Report (EU Directive 2021/514) ───

    @Post('dac7/generate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async generateDAC7Report(@Body() dto: GenerateDAC7Dto) {
        return this.dac7Service.generateReport(dto.year);
    }

    // ─── Chargeback Routing (PSD2 Compliance) ───

    @Post('chargeback/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async routeChargeback(@Param('orderId') orderId: string) {
        return this.financialService.routeChargeback(orderId);
    }
}
