/**
 * Forward Contracts Service
 * 
 * Implements the bilateral commercial forward contracts (NOT futures).
 * Per master architecture: CAEN 4611 intermediary, physical delivery only.
 * 
 * Features:
 * - Create forward with auto 10% deposit calculation
 * - Status machine (DRAFT → ACTIVE → DELIVERED → COMPLETED)
 * - Invoice generation with reverse charge VAT (Art. 331)
 * - Contract listing and statistics
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForwardContract, ForwardContractStatus } from '../entities/forward-contract.entity';
import { CreateForwardContractDto, UpdateForwardContractStatusDto } from '../dto/forward-contract.dto';

@Injectable()
export class ForwardContractService {
    constructor(
        @InjectRepository(ForwardContract) private readonly contractRepo: Repository<ForwardContract>,
    ) { }

    /** Create a new forward contract with 10% deposit */
    async create(dto: CreateForwardContractDto, sellerCompanyId: string): Promise<ForwardContract> {
        const totalValue = dto.quantity * dto.pricePerTon;
        const depositAmount = Math.round(totalValue * 0.10); // 10% advance

        const contract = this.contractRepo.create({
            contractCode: `FWD-${Date.now().toString().slice(-7)}`,
            commodityName: dto.commodityName,
            commodity: dto.commodityId ? { id: dto.commodityId } as any : undefined,
            seller: { id: sellerCompanyId } as any,
            buyerName: dto.buyerName,
            quantity: dto.quantity,
            pricePerTon: dto.pricePerTon,
            totalValue,
            depositAmount,
            deliveryDate: new Date(dto.deliveryDate),
            status: ForwardContractStatus.ACTIVE,
            reverseChargeVat: true,
        } as any);

        return this.contractRepo.save(contract as any);
    }

    /** Get all forward contracts for a company (seller or buyer) */
    async findByCompany(companyId: string): Promise<ForwardContract[]> {
        return this.contractRepo.find({
            where: [
                { seller: { id: companyId } },
                { buyer: { id: companyId } },
            ],
            relations: ['commodity', 'seller', 'buyer'],
            order: { createdAt: 'DESC' },
        });
    }

    /** Get single contract by ID */
    async findById(id: string): Promise<ForwardContract> {
        const contract = await this.contractRepo.findOne({
            where: { id },
            relations: ['commodity', 'seller', 'buyer'],
        });
        if (!contract) throw new NotFoundException('Forward contract not found');
        return contract;
    }

    /** Update contract status with validation */
    async updateStatus(id: string, dto: UpdateForwardContractStatusDto): Promise<ForwardContract> {
        const contract = await this.findById(id);
        const validTransitions: Record<string, string[]> = {
            [ForwardContractStatus.DRAFT]: [ForwardContractStatus.ACTIVE, ForwardContractStatus.CANCELLED],
            [ForwardContractStatus.ACTIVE]: [ForwardContractStatus.DEPOSIT_ESCROWED, ForwardContractStatus.CANCELLED, ForwardContractStatus.DISPUTED],
            [ForwardContractStatus.DEPOSIT_ESCROWED]: [ForwardContractStatus.DELIVERY_SCHEDULED, ForwardContractStatus.CANCELLED, ForwardContractStatus.DISPUTED],
            [ForwardContractStatus.DELIVERY_SCHEDULED]: [ForwardContractStatus.DELIVERED, ForwardContractStatus.DISPUTED],
            [ForwardContractStatus.DELIVERED]: [ForwardContractStatus.COMPLETED, ForwardContractStatus.DISPUTED],
        };

        const allowed = validTransitions[contract.status] || [];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(`Invalid transition: ${contract.status} → ${dto.status}. Allowed: ${allowed.join(', ')}`);
        }

        contract.status = dto.status as ForwardContractStatus;
        return this.contractRepo.save(contract);
    }

    /** Generate invoice data with Tax Engine (reverse charge) */
    async generateInvoice(id: string) {
        const contract = await this.findById(id);
        const subtotal = Number(contract.totalValue);
        const reverseCharge = contract.reverseChargeVat;
        const vat = reverseCharge ? 0 : Math.round(subtotal * 0.19);

        return {
            invoiceNumber: `FC-${Date.now().toString().slice(-6)}`,
            invoiceDate: new Date().toISOString(),
            contractCode: contract.contractCode,
            seller: contract.seller,
            buyerName: contract.buyerName,
            commodityName: contract.commodityName,
            quantity: contract.quantity,
            pricePerTon: contract.pricePerTon,
            subtotal,
            reverseChargeVat: reverseCharge,
            vatRate: reverseCharge ? '0% — Taxare Inversă Art. 331 CF' : '19%',
            vatAmount: vat,
            total: subtotal + vat,
            legalNote: reverseCharge
                ? 'TVA se colectează de cumpărător conform Art. 331 Cod Fiscal (Taxare Inversă).'
                : '',
        };
    }

    /** Get forward contract statistics */
    async getStats(companyId?: string) {
        const qb = this.contractRepo.createQueryBuilder('fc');
        if (companyId) {
            qb.where('fc.seller_id = :companyId OR fc.buyer_id = :companyId', { companyId });
        }
        const contracts = await qb.getMany();
        const active = contracts.filter(c => c.status === ForwardContractStatus.ACTIVE || c.status === ForwardContractStatus.DEPOSIT_ESCROWED);
        const totalForwardValue = active.reduce((sum, c) => sum + Number(c.totalValue), 0);
        const totalDeposits = active.reduce((sum, c) => sum + Number(c.depositAmount), 0);

        return {
            totalContracts: contracts.length,
            activeContracts: active.length,
            totalForwardValue,
            totalDepositsEscrowed: totalDeposits,
            nextDelivery: active.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())[0]?.deliveryDate || null,
        };
    }
}
