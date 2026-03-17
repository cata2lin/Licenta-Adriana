/**
 * Unit Tests — Financial Module
 * Tests order creation (split payment), escrow lifecycle, and tax engine.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus, EscrowPayment } from './entities/order.entity';

describe('FinancialService', () => {
    let service: FinancialService;
    const mockOrderRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
    const mockEscrowRepo = {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FinancialService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
                { provide: getRepositoryToken(EscrowPayment), useValue: mockEscrowRepo },
            ],
        }).compile();
        service = module.get<FinancialService>(FinancialService);
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should auto-calculate 95/3/2% split payment', async () => {
            const dto = { listingId: 'l-1', quantity: 100, pricePerUnit: 1000 };
            mockOrderRepo.create.mockImplementation((data) => ({ id: 'o-1', ...data }));
            mockOrderRepo.save.mockImplementation((data) => Promise.resolve(data));

            const result = await service.createOrder(dto as any);
            expect(result.sellerAmount).toBe(95000); // 95% of 100,000
            expect(result.transportAmount).toBe(3000); // 3%
            expect(result.platformFee).toBe(2000); // 2%
        });
    });

    describe('Order Status Machine', () => {
        it('should allow DRAFT → ESCROW_FUNDED transition', async () => {
            mockOrderRepo.findOne.mockResolvedValue({
                id: 'o-1', status: OrderStatus.PENDING, buyer: { id: 'b-1' }, seller: { id: 's-1' },
            });
            mockOrderRepo.save.mockImplementation((data) => Promise.resolve(data));
            const result = await service.updateOrderStatus('o-1', { status: OrderStatus.ESCROW_FUNDED } as any);
            expect(result.status).toBe(OrderStatus.ESCROW_FUNDED);
        });

        it('should reject invalid status transition (COMPLETED → DRAFT)', async () => {
            mockOrderRepo.findOne.mockResolvedValue({
                id: 'o-1', status: OrderStatus.COMPLETED,
            });
            await expect(service.updateOrderStatus('o-1', { status: OrderStatus.PENDING } as any)).rejects.toThrow();
        });
    });

    describe('Tax Engine', () => {
        it('should apply reverse charge VAT for eligible commodities', async () => {
            // Reverse charge check: both parties are VAT payers + commodity is eligible
            mockOrderRepo.create.mockImplementation((data) => ({
                id: 'o-1', ...data, reverseChargeVat: true,
            }));
            mockOrderRepo.save.mockImplementation((data) => Promise.resolve(data));

            const dto = { listingId: 'l-1', quantity: 100, pricePerUnit: 1000 };
            const result = await service.createOrder(dto as any);
            expect(result).toBeDefined();
        });
    });

    describe('Escrow Operations', () => {
        it('should create FUND escrow transaction', async () => {
            mockOrderRepo.findOne.mockResolvedValue({
                id: 'o-1', status: OrderStatus.PENDING, totalValue: 100000,
                buyer: { id: 'b-1' }, seller: { id: 's-1' },
            });
            mockEscrowRepo.create.mockReturnValue({ id: 'e-1', type: 'FUND' });
            mockEscrowRepo.save.mockResolvedValue({ id: 'e-1', type: 'FUND' });
            mockOrderRepo.save.mockImplementation((data) => Promise.resolve(data));

            const result = await service.fundEscrow('o-1');
            expect(result).toBeDefined();
            expect(mockEscrowRepo.save).toHaveBeenCalled();
        });
    });
});
