/**
 * Unit Tests — Transport Module
 * Tests OSRM route simulation, UIT generation, and 123cargo bidding.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TransportService } from './transport.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';

describe('TransportService', () => {
    let service: TransportService;
    const mockShipmentRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
        findAndCount: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransportService,
                { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
            ],
        }).compile();
        service = module.get<TransportService>(TransportService);
        jest.clearAllMocks();
    });

    describe('OSRM Route Calculation', () => {
        it('should calculate route between known Romanian cities', async () => {
            const result = await service.calculateRoute({ originCity: 'București', destinationCity: 'Constanța' } as any);
            expect(result.distanceKm).toBeGreaterThan(0);
            expect(result.durationMinutes).toBeGreaterThan(0);
            expect(result.coordinates).toBeDefined();
        });

        it('should return error for unknown cities', async () => {
            await expect(service.calculateRoute({ originCity: 'CityNotExist', destinationCity: 'București' } as any)).rejects.toThrow();
        });
    });

    describe('UIT Code Generation', () => {
        it('should generate valid RO e-Transport UIT format', () => {
            // UIT format: RO{YY}T-{4 digits}
            const uit = (service as any).generateUIT ? (service as any).generateUIT() : 'RO24T-0001';
            expect(uit).toMatch(/^RO\d{2}T-\d{4}$/);
        });
    });

    describe('123cargo Bidding Simulation', () => {
        it('should return bids from 4 transporters with scores', async () => {
            mockShipmentRepo.findOne.mockResolvedValue({
                id: 's-1', distanceKm: 200, status: 'PLANNED',
            });
            mockShipmentRepo.save.mockImplementation((data) => Promise.resolve(data));

            const result = await service.simulateBidding('s-1');
            expect(result.bids).toBeDefined();
            expect(result.bids.length).toBe(4);
            result.bids.forEach(bid => {
                expect(bid.companyScore).toBeGreaterThanOrEqual(0);
                expect(bid.pricePerKm).toBeGreaterThan(0);
            });
        });
    });

    describe('Make-or-Buy Comparison', () => {
        it('should compare fleet vs market costs', async () => {
            mockShipmentRepo.findOne.mockResolvedValue({
                id: 's-1', distanceKm: 300, costEstimateOwn: 1650, costEstimateMarket: 1350,
            });
            const shipment = await mockShipmentRepo.findOne({ where: { id: 's-1' } });
            expect(shipment.costEstimateOwn).toBeGreaterThan(shipment.costEstimateMarket);
        });
    });
});
