/**
 * Trading Service — Business Logic for Commodities & Listings
 * 
 * Handles:
 * - Commodity dictionary CRUD (Admin only)
 * - Listing CRUD (Sellers create, all read)
 * - Advanced search with JSONB biochemical parameter filtering
 *   Uses TypeORM QueryBuilder to build dynamic WHERE clauses
 *   that leverage the GIN index on `biochem_params`.
 * 
 * This module is 100% isolated from IAM, Financial, and Transport modules.
 * Communication happens only through entity IDs.
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commodity } from './entities/commodity.entity';
import { Listing, ListingStatus } from './entities/listing.entity';
import { CreateCommodityDto, UpdateCommodityDto, CreateListingDto, UpdateListingDto, SearchListingsDto } from './dto/trading.dto';

@Injectable()
export class TradingService {
    constructor(
        @InjectRepository(Commodity) private readonly commodityRepo: Repository<Commodity>,
        @InjectRepository(Listing) private readonly listingRepo: Repository<Listing>,
    ) { }

    // ─── Commodity CRUD (Admin Only) ───

    async createCommodity(dto: CreateCommodityDto): Promise<Commodity> {
        const commodity = this.commodityRepo.create({
            name: dto.name,
            ncCode: dto.ncCode,
            standardRef: dto.standardRef,
            category: dto.category,
            unitOfMeasure: dto.unitOfMeasure || 'tone',
            reverseChargeVat: dto.reverseChargeVat ?? true,
            vatRate: dto.vatRate ?? 9.00,
            paramSchema: dto.paramSchema || null,
        });
        return this.commodityRepo.save(commodity);
    }

    async findAllCommodities(): Promise<Commodity[]> {
        return this.commodityRepo.find({ where: { isActive: true }, order: { category: 'ASC', name: 'ASC' } });
    }

    async findCommodityById(id: string): Promise<Commodity> {
        const commodity = await this.commodityRepo.findOne({ where: { id } });
        if (!commodity) throw new NotFoundException(`Commodity ${id} not found`);
        return commodity;
    }

    async updateCommodity(id: string, dto: UpdateCommodityDto): Promise<Commodity> {
        const commodity = await this.findCommodityById(id);
        Object.assign(commodity, dto);
        return this.commodityRepo.save(commodity);
    }

    async deactivateCommodity(id: string): Promise<void> {
        const commodity = await this.findCommodityById(id);
        commodity.isActive = false;
        await this.commodityRepo.save(commodity);
    }

    // ─── Listing CRUD ───

    async createListing(dto: CreateListingDto, sellerId: string): Promise<Listing> {
        const commodity = await this.findCommodityById(dto.commodityId);

        const listing = this.listingRepo.create({
            commodity,
            seller: { id: sellerId } as any, // Set by company ID from JWT token
            title: dto.title,
            quantity: dto.quantity,
            pricePerUnit: dto.pricePerUnit,
            biochemParams: dto.biochemParams || {},
            location: dto.location,
            county: dto.county,
            availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
            availableTo: dto.availableTo ? new Date(dto.availableTo) : null,
            status: ListingStatus.ACTIVE,
        });

        return this.listingRepo.save(listing);
    }

    async findListingById(id: string): Promise<Listing> {
        const listing = await this.listingRepo.findOne({ where: { id }, relations: ['commodity', 'seller'] });
        if (!listing) throw new NotFoundException(`Listing ${id} not found`);
        return listing;
    }

    async updateListing(id: string, dto: UpdateListingDto, companyId: string): Promise<Listing> {
        const listing = await this.findListingById(id);
        if (listing.seller.id !== companyId) {
            throw new ForbiddenException('You can only edit your own listings');
        }
        Object.assign(listing, dto);
        return this.listingRepo.save(listing);
    }

    async deleteListing(id: string, companyId: string): Promise<void> {
        const listing = await this.findListingById(id);
        if (listing.seller.id !== companyId) {
            throw new ForbiddenException('You can only delete your own listings');
        }
        await this.listingRepo.remove(listing);
    }

    /** Get all listings for a specific seller company */
    async findMyListings(companyId: string): Promise<Listing[]> {
        return this.listingRepo.find({
            where: { seller: { id: companyId }, status: ListingStatus.ACTIVE },
            relations: ['commodity', 'seller'],
            order: { createdAt: 'DESC' },
        });
    }

    // ─── Advanced Search Engine (GIN Index on JSONB) ───

    /**
     * Performs an advanced search on listings using:
     * - Category filtering
     * - Full-text search on title/seller name
     * - Price range
     * - Biochemical parameter ranges (JSONB queries using GIN index)
     * - County filtering
     * - Sorting (price asc/desc, quantity, newest)
     * - Pagination
     */
    async searchListings(dto: SearchListingsDto): Promise<{ listings: Listing[]; total: number }> {
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const offset = (page - 1) * limit;

        const qb = this.listingRepo.createQueryBuilder('listing')
            .leftJoinAndSelect('listing.commodity', 'commodity')
            .leftJoinAndSelect('listing.seller', 'seller')
            .where('listing.status = :status', { status: ListingStatus.ACTIVE });

        // Category filter
        if (dto.category) {
            qb.andWhere('commodity.category = :category', { category: dto.category });
        }

        // Text search (title or seller company name)
        if (dto.search) {
            qb.andWhere(
                '(LOWER(listing.title) LIKE LOWER(:search) OR LOWER(seller.company_name) LIKE LOWER(:search))',
                { search: `%${dto.search}%` },
            );
        }

        // Price range
        if (dto.minPrice != null) {
            qb.andWhere('listing.price_per_unit >= :minPrice', { minPrice: dto.minPrice });
        }
        if (dto.maxPrice != null) {
            qb.andWhere('listing.price_per_unit <= :maxPrice', { maxPrice: dto.maxPrice });
        }

        // County filter
        if (dto.county) {
            qb.andWhere('listing.county = :county', { county: dto.county });
        }

        // ─── JSONB Biochemical Parameter Queries (GIN Index) ───
        // These use PostgreSQL's JSONB operators to filter directly on the indexed column

        if (dto.minProtein != null) {
            qb.andWhere("(listing.biochem_params->>'protein')::numeric >= :minProtein", { minProtein: dto.minProtein });
        }

        if (dto.maxMoisture != null) {
            qb.andWhere("(listing.biochem_params->>'moisture')::numeric <= :maxMoisture", { maxMoisture: dto.maxMoisture });
        }

        if (dto.minHectoliter != null) {
            qb.andWhere("(listing.biochem_params->>'hectoliter')::numeric >= :minHectoliter", { minHectoliter: dto.minHectoliter });
        }

        // Sorting
        switch (dto.sortBy) {
            case 'price_asc': qb.orderBy('listing.price_per_unit', 'ASC'); break;
            case 'price_desc': qb.orderBy('listing.price_per_unit', 'DESC'); break;
            case 'quantity': qb.orderBy('listing.quantity', 'DESC'); break;
            case 'newest':
            default: qb.orderBy('listing.created_at', 'DESC'); break;
        }

        // Pagination
        qb.skip(offset).take(limit);

        const [listings, total] = await qb.getManyAndCount();
        return { listings, total };
    }
}
