/**
 * Unit Tests — Trading Module
 * Tests commodity CRUD, listing CRUD, and JSONB search.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Commodity } from './entities/commodity.entity';
import { Listing } from './entities/listing.entity';

describe('TradingService', () => {
    let service: TradingService;
    const mockCommodityRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };
    const mockListingRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TradingService,
                { provide: getRepositoryToken(Commodity), useValue: mockCommodityRepo },
                { provide: getRepositoryToken(Listing), useValue: mockListingRepo },
            ],
        }).compile();
        service = module.get<TradingService>(TradingService);
        jest.clearAllMocks();
    });

    describe('Commodity CRUD', () => {
        it('should list all active commodities', async () => {
            const mock = [{ id: '1', name: 'Grâu', isActive: true }];
            mockCommodityRepo.find.mockResolvedValue(mock);
            const result = await service.findAllCommodities();
            expect(result).toEqual(mock);
        });

        it('should create a commodity', async () => {
            const dto = { name: 'Rapiță', ncCode: '1205', category: 'Oleaginoase' };
            mockCommodityRepo.create.mockReturnValue({ id: '2', ...dto });
            mockCommodityRepo.save.mockResolvedValue({ id: '2', ...dto });
            const result = await service.createCommodity(dto as any);
            expect(result.name).toBe('Rapiță');
        });
    });

    describe('Listing CRUD', () => {
        it('should create a listing with biochem params', async () => {
            const dto = { commodityId: '1', quantity: 100, pricePerUnit: 1200, county: 'Constanța', biochemParams: { protein: 14.2, moisture: 12.5 } };
            mockCommodityRepo.findOne.mockResolvedValue({ id: '1', name: 'Grâu' });
            mockListingRepo.create.mockReturnValue({ id: 'l-1', ...dto });
            mockListingRepo.save.mockResolvedValue({ id: 'l-1', ...dto });
            const result = await service.createListing(dto as any, 'company-1');
            expect(result).toBeDefined();
            expect(mockListingRepo.save).toHaveBeenCalled();
        });
    });

    describe('JSONB Search', () => {
        it('should build search query with biochemical filters', async () => {
            const qb = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            };
            mockListingRepo.createQueryBuilder.mockReturnValue(qb);
            const result = await service.searchListings({ minProtein: 13, maxMoisture: 14 } as any);
            expect(qb.andWhere).toHaveBeenCalled();
        });
    });
});
