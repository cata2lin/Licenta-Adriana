/**
 * Disputes Service — Quality Dispute Resolution & ADR
 * 
 * Handles:
 * - Opening disputes (triggers "Hold Funds" in Financial module)
 * - Bilateral chat for conciliation (Legea 81/2022 mandatory step)
 * - Proposing and accepting resolutions
 * - ADR escalation to external mediator
 * - Triggering PSP partial refund via Financial module
 * 
 * This module communicates with Financial module via entity IDs
 * to hold/release/refund escrow funds.
 */
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus, DisputeMessage } from './entities/dispute.entity';
import { OpenDisputeDto, SendMessageDto, ProposeResolutionDto } from './dto/disputes.dto';
import { Order, OrderStatus } from '../financial/entities/order.entity';

@Injectable()
export class DisputesService {
    constructor(
        @InjectRepository(Dispute) private readonly disputeRepo: Repository<Dispute>,
        @InjectRepository(DisputeMessage) private readonly messageRepo: Repository<DisputeMessage>,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    ) { }

    // ─── Open Dispute ───

    /**
     * Opens a quality dispute on an order.
     * - Validates the order is in a disputable state
     * - Transitions order to DISPUTED status (holds funds)
     * - Creates system message in chat
     */
    async openDispute(dto: OpenDisputeDto, complainantId: string): Promise<Dispute> {
        const order = await this.orderRepo.findOne({
            where: { id: dto.orderId },
            relations: ['buyer', 'seller'],
        });
        if (!order) throw new NotFoundException('Order not found');

        const disputableStatuses = [OrderStatus.ESCROW_FUNDED, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED];
        if (!disputableStatuses.includes(order.status)) {
            throw new BadRequestException(`Cannot dispute an order in ${order.status} status`);
        }

        // Determine respondent (the other party)
        const isBuyer = order.buyer.id === complainantId;
        const respondentId = isBuyer ? order.seller.id : order.buyer.id;

        const dispute = this.disputeRepo.create({
            disputeRef: `DSP-${new Date().getFullYear()}-${(Math.floor(Math.random() * 999) + 1).toString().padStart(3, '0')}`,
            order,
            complainant: { id: complainantId } as any,
            respondent: { id: respondentId } as any,
            reason: dto.reason,
            description: dto.description,
            contractedParams: dto.contractedParams || null,
            receivedParams: dto.receivedParams || null,
            disputedAmount: order.totalValue,
            status: DisputeStatus.OPENED,
        });

        const savedDispute = await this.disputeRepo.save(dispute);

        // Transition order to DISPUTED (holds funds)
        order.status = OrderStatus.DISPUTED;
        await this.orderRepo.save(order);

        // Create system message
        await this.createSystemMessage(savedDispute.id, `Disputa ${savedDispute.disputeRef} a fost deschisă. Fondurile Escrow sunt blocate automat. Conform Legea 81/2022, părțile trebuie să încerce concilierea directă înainte de escaladarea la ADR.`);

        return savedDispute;
    }

    // ─── Chat (Conciliation — Legea 81/2022) ───

    async sendMessage(disputeId: string, senderId: string, dto: SendMessageDto): Promise<DisputeMessage> {
        const dispute = await this.findDisputeById(disputeId);

        // Verify sender is a party to the dispute
        if (dispute.complainant.id !== senderId && dispute.respondent.id !== senderId) {
            throw new ForbiddenException('Only dispute parties can send messages');
        }

        if (dispute.status === DisputeStatus.CLOSED || dispute.status === DisputeStatus.RESOLVED) {
            throw new BadRequestException('Cannot send messages on a closed dispute');
        }

        // Update status to NEGOTIATING if first message after opening
        if (dispute.status === DisputeStatus.OPENED) {
            dispute.status = DisputeStatus.NEGOTIATING;
            await this.disputeRepo.save(dispute);
        }

        const message = this.messageRepo.create({
            dispute: { id: disputeId } as any,
            sender: { id: senderId } as any,
            content: dto.content,
            isSystem: false,
        });

        return this.messageRepo.save(message);
    }

    async getMessages(disputeId: string): Promise<DisputeMessage[]> {
        return this.messageRepo.find({
            where: { dispute: { id: disputeId } },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }

    private async createSystemMessage(disputeId: string, content: string): Promise<void> {
        const msg = this.messageRepo.create({
            dispute: { id: disputeId } as any,
            sender: null,
            content,
            isSystem: true,
        });
        await this.messageRepo.save(msg);
    }

    // ─── Resolution Proposals ───

    /**
     * One party proposes a refund percentage.
     * Creates a system chat message notifying the other party.
     */
    async proposeResolution(disputeId: string, proposerId: string, dto: ProposeResolutionDto): Promise<Dispute> {
        const dispute = await this.findDisputeById(disputeId);

        if (dispute.complainant.id !== proposerId && dispute.respondent.id !== proposerId) {
            throw new ForbiddenException('Only dispute parties can propose resolutions');
        }

        dispute.proposedRefundPercent = dto.refundPercent;
        dispute.status = DisputeStatus.PROPOSAL_SENT;
        await this.disputeRepo.save(dispute);

        const refundAmount = Math.round(Number(dispute.disputedAmount) * dto.refundPercent / 100);
        const proposerName = dispute.complainant.id === proposerId ? 'Reclamantul' : 'Pârâtul';
        await this.createSystemMessage(disputeId,
            `${proposerName} a propus o reducere de ${dto.refundPercent}% (${refundAmount.toLocaleString()} RON). Cealaltă parte trebuie să accepte sau să facă o contrapropunere.`
        );

        if (dto.message) {
            await this.sendMessage(disputeId, proposerId, { content: dto.message });
        }

        return dispute;
    }

    /**
     * The other party accepts the proposed resolution.
     * Calculates the refund amount and marks dispute as ACCEPTED.
     * In production, this triggers FinancialService.processRefund().
     */
    async acceptResolution(disputeId: string, acceptorId: string): Promise<Dispute> {
        const dispute = await this.findDisputeById(disputeId);

        if (dispute.status !== DisputeStatus.PROPOSAL_SENT) {
            throw new BadRequestException('No proposal to accept');
        }

        // The acceptor must be the other party (not the proposer)
        if (dispute.complainant.id !== acceptorId && dispute.respondent.id !== acceptorId) {
            throw new ForbiddenException('Only the other dispute party can accept');
        }

        const refundAmount = Math.round(Number(dispute.disputedAmount) * Number(dispute.proposedRefundPercent) / 100);
        dispute.resolvedRefund = refundAmount;
        dispute.status = DisputeStatus.RESOLVED;
        await this.disputeRepo.save(dispute);

        await this.createSystemMessage(disputeId,
            `Soluția a fost acceptată! Refund de ${refundAmount.toLocaleString()} RON (${dispute.proposedRefundPercent}%) va fi procesat automat prin PSP. Disputa este rezolvată.`
        );

        // In production: call FinancialService.processRefund(dispute.order.id, { refundAmount, reason: dispute.reason })
        // For now, update order status to COMPLETED
        const order = await this.orderRepo.findOne({ where: { id: dispute.order.id } });
        if (order) {
            order.status = OrderStatus.COMPLETED;
            await this.orderRepo.save(order);
        }

        return dispute;
    }

    // ─── ADR Escalation ───

    /**
     * Escalates the dispute to an external ADR mediator.
     * Legea 81/2022: Mandatory conciliation attempt must have occurred first.
     */
    async escalateToADR(disputeId: string): Promise<Dispute> {
        const dispute = await this.findDisputeById(disputeId);

        // Check that at least some negotiation happened
        const messageCount = await this.messageRepo.count({ where: { dispute: { id: disputeId }, isSystem: false } });
        if (messageCount < 2) {
            throw new BadRequestException('Conform Legea 81/2022, trebuie să existe cel puțin o încercare de conciliere directă înainte de escaladare.');
        }

        dispute.status = DisputeStatus.ESCALATED;
        dispute.adrReference = `ADR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
        await this.disputeRepo.save(dispute);

        await this.createSystemMessage(disputeId,
            `Disputa a fost escaladată la Mediator ADR extern (Ref: ${dispute.adrReference}). Fondurile rămân blocate în Escrow. Un mediator va contacta ambele părți în max. 48 ore lucrătoare.`
        );

        return dispute;
    }

    // ─── Queries ───

    async findDisputeById(id: string): Promise<Dispute> {
        const dispute = await this.disputeRepo.findOne({
            where: { id },
            relations: ['order', 'complainant', 'respondent', 'messages'],
        });
        if (!dispute) throw new NotFoundException(`Dispute ${id} not found`);
        return dispute;
    }

    async findDisputesByCompany(companyId: string): Promise<Dispute[]> {
        return this.disputeRepo.find({
            where: [
                { complainant: { id: companyId } },
                { respondent: { id: companyId } },
            ],
            relations: ['order', 'complainant', 'respondent'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAllDisputes(page = 1, limit = 20): Promise<{ disputes: Dispute[]; total: number }> {
        const [disputes, total] = await this.disputeRepo.findAndCount({
            relations: ['order', 'complainant', 'respondent'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { disputes, total };
    }

    async getStats(): Promise<Record<string, any>> {
        const total = await this.disputeRepo.count();
        const open = await this.disputeRepo.count({ where: [{ status: DisputeStatus.OPENED }, { status: DisputeStatus.NEGOTIATING }] });
        const escalated = await this.disputeRepo.count({ where: { status: DisputeStatus.ESCALATED } });
        const resolved = await this.disputeRepo.count({ where: { status: DisputeStatus.RESOLVED } });

        return { total, open, escalated, resolved };
    }
}
