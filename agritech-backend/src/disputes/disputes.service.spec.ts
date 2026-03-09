/**
 * Unit Tests — Disputes Module
 * Tests dispute lifecycle, chat, resolution, and ADR escalation.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DisputesService } from './disputes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dispute, DisputeStatus, DisputeMessage } from './entities/dispute.entity';
import { Order, OrderStatus } from '../financial/entities/order.entity';

describe('DisputesService', () => {
    let service: DisputesService;
    const mockDisputeRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
        findAndCount: jest.fn(),
    };
    const mockMessageRepo = {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
    };
    const mockOrderRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DisputesService,
                { provide: getRepositoryToken(Dispute), useValue: mockDisputeRepo },
                { provide: getRepositoryToken(DisputeMessage), useValue: mockMessageRepo },
                { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
            ],
        }).compile();
        service = module.get<DisputesService>(DisputesService);
        jest.clearAllMocks();
    });

    describe('openDispute', () => {
        it('should open a dispute and transition order to DISPUTED', async () => {
            mockOrderRepo.findOne.mockResolvedValue({
                id: 'o-1', status: OrderStatus.ESCROW_FUNDED, totalValue: 100000,
                buyer: { id: 'buyer-1' }, seller: { id: 'seller-1' },
            });
            mockDisputeRepo.create.mockReturnValue({ id: 'd-1', status: DisputeStatus.OPENED });
            mockDisputeRepo.save.mockResolvedValue({ id: 'd-1', status: DisputeStatus.OPENED });
            mockMessageRepo.create.mockReturnValue({ id: 'm-1' });
            mockMessageRepo.save.mockResolvedValue({ id: 'm-1' });
            mockOrderRepo.save.mockImplementation((data) => Promise.resolve(data));

            const result = await service.openDispute({
                orderId: 'o-1', reason: 'QUALITY_DEVIATION', description: 'Protein below threshold',
            } as any, 'buyer-1');

            expect(result.status).toBe(DisputeStatus.OPENED);
            expect(mockOrderRepo.save).toHaveBeenCalled();
        });

        it('should reject dispute on non-disputable order', async () => {
            mockOrderRepo.findOne.mockResolvedValue({ id: 'o-1', status: OrderStatus.DRAFT });
            await expect(service.openDispute({ orderId: 'o-1', reason: 'QUALITY_DEVIATION', description: 'Test' } as any, 'buyer-1'))
                .rejects.toThrow();
        });
    });

    describe('Chat Conciliation', () => {
        it('should allow dispute parties to send messages', async () => {
            mockDisputeRepo.findOne.mockResolvedValue({
                id: 'd-1', status: DisputeStatus.OPENED,
                complainant: { id: 'buyer-1' }, respondent: { id: 'seller-1' },
            });
            mockDisputeRepo.save.mockImplementation((data) => Promise.resolve(data));
            mockMessageRepo.create.mockReturnValue({ id: 'm-1' });
            mockMessageRepo.save.mockResolvedValue({ id: 'm-1' });

            const result = await service.sendMessage('d-1', 'buyer-1', { content: 'We demand a refund' });
            expect(result).toBeDefined();
        });

        it('should reject messages from non-parties', async () => {
            mockDisputeRepo.findOne.mockResolvedValue({
                id: 'd-1', status: DisputeStatus.OPENED,
                complainant: { id: 'buyer-1' }, respondent: { id: 'seller-1' },
            });
            await expect(service.sendMessage('d-1', 'stranger-1', { content: 'Hello' }))
                .rejects.toThrow('Only dispute parties can send messages');
        });
    });

    describe('Resolution', () => {
        it('should propose a refund percentage', async () => {
            mockDisputeRepo.findOne.mockResolvedValue({
                id: 'd-1', status: DisputeStatus.NEGOTIATING, disputedAmount: 100000,
                complainant: { id: 'buyer-1' }, respondent: { id: 'seller-1' },
            });
            mockDisputeRepo.save.mockImplementation((data) => Promise.resolve(data));
            mockMessageRepo.create.mockReturnValue({ id: 'm-1' });
            mockMessageRepo.save.mockResolvedValue({ id: 'm-1' });

            const result = await service.proposeResolution('d-1', 'buyer-1', { refundPercent: 8 } as any);
            expect(result.proposedRefundPercent).toBe(8);
            expect(result.status).toBe(DisputeStatus.PROPOSAL_SENT);
        });
    });

    describe('ADR Escalation', () => {
        it('should require minimum conciliation before escalation (Legea 81/2022)', async () => {
            mockDisputeRepo.findOne.mockResolvedValue({
                id: 'd-1', status: DisputeStatus.NEGOTIATING,
                complainant: { id: 'buyer-1' }, respondent: { id: 'seller-1' },
            });
            mockMessageRepo.count.mockResolvedValue(1); // Only 1 message — not enough

            await expect(service.escalateToADR('d-1')).rejects.toThrow(/conciliere/);
        });

        it('should allow escalation after sufficient conciliation attempts', async () => {
            mockDisputeRepo.findOne.mockResolvedValue({
                id: 'd-1', status: DisputeStatus.NEGOTIATING,
                complainant: { id: 'buyer-1' }, respondent: { id: 'seller-1' },
            });
            mockMessageRepo.count.mockResolvedValue(3);
            mockDisputeRepo.save.mockImplementation((data) => Promise.resolve(data));
            mockMessageRepo.create.mockReturnValue({ id: 'm-1' });
            mockMessageRepo.save.mockResolvedValue({ id: 'm-1' });

            const result = await service.escalateToADR('d-1');
            expect(result.status).toBe(DisputeStatus.ESCALATED);
            expect(result.adrReference).toMatch(/^ADR-\d{4}-\d{4}$/);
        });
    });
});
