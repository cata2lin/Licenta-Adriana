/**
 * Financial Service — Order Lifecycle & Escrow Management
 * 
 * Handles:
 * - Order creation with auto-calculated split payment (95/3/2%)
 * - Order status transitions (pending → funded → in-transit → delivered → completed)
 * - Escrow operations: fund, release, partial refund
 * - Tax engine: reverse charge VAT (Art. 331 Cod Fiscal)
 * - Human-readable order reference generation (AGR-YYYY-NNN)
 * 
 * This module is isolated. Communicates with Trading module only via entity IDs.
 * PSP integration (Mangopay/Libra Bank) is abstracted via the escrow methods.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, ContractType, EscrowPayment, EscrowAction } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto, ProcessRefundDto } from './dto/financial.dto';

/** Platform fee percentages — configurable constants */
const SELLER_PERCENT = 0.95;
const TRANSPORT_PERCENT = 0.03;
const PLATFORM_PERCENT = 0.02;

@Injectable()
export class FinancialService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(EscrowPayment) private readonly escrowRepo: Repository<EscrowPayment>,
    ) { }

    // ─── Order Reference Generator ───

    private async generateOrderRef(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.orderRepo.count();
        return `AGR-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }

    // ─── Tax Engine ───

    /**
     * Determines if reverse charge VAT applies.
     * Art. 331 Cod Fiscal: Both parties must be VAT payers for reverse charge.
     * In production, this calls ANAF API to verify VAT status of both companies.
     */
    private calculateVAT(totalValue: number, reverseCharge: boolean, vatRate = 0.09): { vatAmount: number; totalWithVAT: number } {
        if (reverseCharge) {
            return { vatAmount: 0, totalWithVAT: totalValue };
        }
        const vatAmount = Math.round(totalValue * vatRate * 100) / 100;
        return { vatAmount, totalWithVAT: totalValue + vatAmount };
    }

    // ─── Order CRUD ───

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const totalValue = dto.quantity * dto.pricePerUnit;
        const reverseCharge = dto.reverseCharge ?? true;
        const { vatAmount } = this.calculateVAT(totalValue, reverseCharge);

        const order = this.orderRepo.create({
            orderRef: await this.generateOrderRef(),
            buyer: { id: dto.buyerId } as any,
            seller: { id: dto.sellerId } as any,
            listing: dto.listingId ? { id: dto.listingId } as any : null,
            contractType: dto.contractType,
            productDescription: dto.productDescription,
            quantity: dto.quantity,
            pricePerUnit: dto.pricePerUnit,
            totalValue,
            sellerAmount: Math.round(totalValue * SELLER_PERCENT * 100) / 100,
            transportAmount: Math.round(totalValue * TRANSPORT_PERCENT * 100) / 100,
            platformFee: Math.round(totalValue * PLATFORM_PERCENT * 100) / 100,
            reverseCharge,
            vatAmount,
            status: OrderStatus.PENDING,
            deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
            notes: dto.notes,
        });

        const savedOrder = await this.orderRepo.save(order);
        return savedOrder;
    }

    async findOrderById(id: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['buyer', 'seller', 'listing', 'escrowPayments'],
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    async findOrderByRef(ref: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { orderRef: ref },
            relations: ['buyer', 'seller', 'listing', 'escrowPayments'],
        });
        if (!order) throw new NotFoundException(`Order ${ref} not found`);
        return order;
    }

    async findOrdersByCompany(companyId: string): Promise<Order[]> {
        return this.orderRepo.find({
            where: [
                { buyer: { id: companyId } },
                { seller: { id: companyId } },
            ],
            relations: ['buyer', 'seller', 'escrowPayments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAllOrders(page = 1, limit = 20): Promise<{ orders: Order[]; total: number }> {
        const [orders, total] = await this.orderRepo.findAndCount({
            relations: ['buyer', 'seller'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { orders, total };
    }

    // ─── Order Status Transitions ───

    async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.findOrderById(id);

        // Validate status transition
        this.validateStatusTransition(order.status, dto.status);

        order.status = dto.status;
        if (dto.uitCode) order.uitCode = dto.uitCode;
        if (dto.notes) order.notes = dto.notes;

        return this.orderRepo.save(order);
    }

    private validateStatusTransition(current: OrderStatus, next: OrderStatus): void {
        const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.ESCROW_FUNDED, OrderStatus.CANCELLED],
            [OrderStatus.ESCROW_FUNDED]: [OrderStatus.IN_TRANSIT, OrderStatus.DISPUTED, OrderStatus.CANCELLED],
            [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.DISPUTED],
            [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
            [OrderStatus.COMPLETED]: [],
            [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
            [OrderStatus.CANCELLED]: [],
        };

        if (!allowedTransitions[current]?.includes(next)) {
            throw new BadRequestException(`Cannot transition from ${current} to ${next}`);
        }
    }

    // ─── Escrow Operations ───

    /**
     * Simulate funding the escrow (in production: Mangopay PayIn or Libra Bank PISP).
     * Creates a FUND escrow record and transitions order to ESCROW_FUNDED.
     */
    async fundEscrow(orderId: string): Promise<EscrowPayment> {
        const order = await this.findOrderById(orderId);
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order must be in PENDING status to fund escrow');
        }

        const payment = this.escrowRepo.create({
            order,
            action: EscrowAction.FUND,
            amount: order.totalValue,
            fromAccount: `vIBAN-buyer-${order.buyer.id.slice(0, 8)}`,
            toAccount: `ESCROW-${order.orderRef}`,
            pspTransactionId: `PSP-${Date.now()}`, // Simulated
            paymentStatus: 'COMPLETED',
        });

        await this.escrowRepo.save(payment);

        // Transition order to ESCROW_FUNDED
        order.status = OrderStatus.ESCROW_FUNDED;
        await this.orderRepo.save(order);

        return payment;
    }

    /**
     * Release escrow funds (split payment: seller + transport + platform).
     * In production: 3 separate Mangopay Transfers.
     */
    async releaseEscrow(orderId: string): Promise<EscrowPayment[]> {
        const order = await this.findOrderById(orderId);
        if (order.status !== OrderStatus.DELIVERED) {
            throw new BadRequestException('Order must be DELIVERED to release escrow');
        }

        const payments: EscrowPayment[] = [];

        // Release to seller
        payments.push(this.escrowRepo.create({
            order, action: EscrowAction.RELEASE,
            amount: order.sellerAmount,
            fromAccount: `ESCROW-${order.orderRef}`,
            toAccount: `vIBAN-seller-${order.seller.id.slice(0, 8)}`,
            pspTransactionId: `PSP-${Date.now()}-seller`,
            paymentStatus: 'COMPLETED',
        }));

        // Transport fee
        payments.push(this.escrowRepo.create({
            order, action: EscrowAction.RELEASE,
            amount: order.transportAmount,
            fromAccount: `ESCROW-${order.orderRef}`,
            toAccount: 'TRANSPORT-POOL',
            pspTransactionId: `PSP-${Date.now()}-transport`,
            paymentStatus: 'COMPLETED',
        }));

        // Platform fee
        payments.push(this.escrowRepo.create({
            order, action: EscrowAction.PLATFORM_FEE,
            amount: order.platformFee,
            fromAccount: `ESCROW-${order.orderRef}`,
            toAccount: 'PLATFORM-REVENUE',
            pspTransactionId: `PSP-${Date.now()}-platform`,
            paymentStatus: 'COMPLETED',
        }));

        await this.escrowRepo.save(payments);

        // Transition order to COMPLETED
        order.status = OrderStatus.COMPLETED;
        await this.orderRepo.save(order);

        return payments;
    }

    /**
     * Process a partial refund for a dispute resolution.
     * In production: Mangopay Refund API or Libra Bank reversal.
     */
    async processRefund(orderId: string, dto: ProcessRefundDto): Promise<EscrowPayment> {
        const order = await this.findOrderById(orderId);
        if (order.status !== OrderStatus.DISPUTED) {
            throw new BadRequestException('Order must be in DISPUTED status for refund');
        }

        if (dto.refundAmount > Number(order.totalValue)) {
            throw new BadRequestException('Refund amount cannot exceed order total');
        }

        const payment = this.escrowRepo.create({
            order,
            action: dto.refundAmount >= Number(order.totalValue) ? EscrowAction.REFUND : EscrowAction.PARTIAL_REFUND,
            amount: dto.refundAmount,
            fromAccount: `ESCROW-${order.orderRef}`,
            toAccount: `vIBAN-buyer-${order.buyer.id.slice(0, 8)}`,
            pspTransactionId: `PSP-${Date.now()}-refund`,
            paymentStatus: 'COMPLETED',
        });

        await this.escrowRepo.save(payment);

        // Update seller amount (deduct refund)
        order.sellerAmount = Number(order.sellerAmount) - dto.refundAmount;
        order.status = OrderStatus.COMPLETED;
        await this.orderRepo.save(order);

        return payment;
    }

    // ─── Statistics (for Admin Dashboard) ───

    async getStats(): Promise<Record<string, any>> {
        const totalOrders = await this.orderRepo.count();
        const activeOrders = await this.orderRepo.count({ where: [{ status: OrderStatus.ESCROW_FUNDED }, { status: OrderStatus.IN_TRANSIT }] });
        const disputedOrders = await this.orderRepo.count({ where: { status: OrderStatus.DISPUTED } });

        const revenueResult = await this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.platform_fee)', 'totalRevenue')
            .where('order.status = :status', { status: OrderStatus.COMPLETED })
            .getRawOne();

        return {
            totalOrders,
            activeOrders,
            disputedOrders,
            totalRevenue: parseFloat(revenueResult?.totalRevenue || '0'),
        };
    }

    // ─── Chargeback Routing (PSD2/PSD3 Compliance) ───

    /**
     * Routes a chargeback to the responsible seller's PSP sub-account.
     * Per master architecture: "Chargeback Routing" ensures the marketplace
     * does not absorb financial losses due to seller misconduct.
     * 
     * In production: calls Mangopay `deductFromOneBalanceAccount` or 
     * Libra Bank reversal API targeting the seller's Safeguarded Account.
     */
    async routeChargeback(orderId: string): Promise<{ chargebackId: string; debitedAccount: string; amount: number; status: string }> {
        const order = await this.findOrderById(orderId);

        if (order.status !== OrderStatus.DISPUTED && order.status !== OrderStatus.COMPLETED) {
            throw new BadRequestException('Chargeback can only be processed on DISPUTED or COMPLETED orders');
        }

        // Create a debit record for the chargeback
        const chargebackPayment = this.escrowRepo.create({
            order,
            action: EscrowAction.REFUND, // Chargeback is effectively a forced refund
            amount: Number(order.totalValue),
            fromAccount: `vIBAN-seller-${order.seller.id.slice(0, 8)}`,
            toAccount: `CHARGEBACK-RECOVERY-${order.orderRef}`,
            pspTransactionId: `CB-${Date.now()}`,
            paymentStatus: 'COMPLETED',
        });

        await this.escrowRepo.save(chargebackPayment);

        // Mark order as cancelled due to chargeback
        order.status = OrderStatus.CANCELLED;
        order.notes = `${order.notes || ''} [CHARGEBACK] Processed ${new Date().toISOString()}`;
        await this.orderRepo.save(order);

        return {
            chargebackId: chargebackPayment.pspTransactionId,
            debitedAccount: chargebackPayment.fromAccount,
            amount: Number(order.totalValue),
            status: 'ROUTED_TO_SELLER',
        };
    }
}
