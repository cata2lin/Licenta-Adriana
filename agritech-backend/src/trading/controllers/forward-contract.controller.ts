/**
 * Forward Contracts Controller
 * 
 * REST API for forward contract management.
 * All endpoints require JWT authentication.
 */
import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ForwardContractService } from '../services/forward-contract.service';
import { CreateForwardContractDto, UpdateForwardContractStatusDto } from '../dto/forward-contract.dto';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';

@Controller('trading/forward-contracts')
@UseGuards(JwtAuthGuard)
export class ForwardContractController {
    constructor(private readonly forwardService: ForwardContractService) { }

    /** Create a new forward contract */
    @Post()
    async create(@Body() dto: CreateForwardContractDto, @Request() req: any) {
        return this.forwardService.create(dto, req.user.companyId);
    }

    /** List forward contracts for current company */
    @Get()
    async findAll(@Request() req: any) {
        return this.forwardService.findByCompany(req.user.companyId);
    }

    /** Get single forward contract */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.forwardService.findById(id);
    }

    /** Update forward contract status */
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateForwardContractStatusDto) {
        return this.forwardService.updateStatus(id, dto);
    }

    /** Generate invoice for a forward contract */
    @Get(':id/invoice')
    async generateInvoice(@Param('id') id: string) {
        return this.forwardService.generateInvoice(id);
    }

    /** Get forward contract statistics */
    @Get('stats/summary')
    async getStats(@Request() req: any) {
        return this.forwardService.getStats(req.user.companyId);
    }
}
