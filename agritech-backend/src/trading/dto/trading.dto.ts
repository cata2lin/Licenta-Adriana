/**
 * DTOs for the Trading Module.
 * Validation rules ensure data integrity at the controller layer.
 * Separate DTOs for Create, Update, and Query operations (CQRS-inspired).
 */
import { IsString, IsNumber, IsOptional, IsObject, IsEnum, IsUUID, Min, IsDateString } from 'class-validator';
import { ListingStatus } from '../entities/listing.entity';

// ─── Commodity DTOs ───

export class CreateCommodityDto {
    @IsString()
    name: string;

    @IsString()
    ncCode: string;

    @IsString()
    standardRef: string;

    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    unitOfMeasure?: string;

    @IsOptional()
    reverseChargeVat?: boolean;

    @IsOptional()
    @IsNumber()
    vatRate?: number;

    @IsOptional()
    @IsObject()
    paramSchema?: Record<string, any>;
}

export class UpdateCommodityDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    ncCode?: string;

    @IsOptional()
    @IsString()
    standardRef?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    reverseChargeVat?: boolean;

    @IsOptional()
    @IsNumber()
    vatRate?: number;

    @IsOptional()
    @IsObject()
    paramSchema?: Record<string, any>;
}

// ─── Listing DTOs ───

export class CreateListingDto {
    @IsUUID()
    commodityId: string;

    @IsString()
    title: string;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    @IsNumber()
    @Min(0.01)
    pricePerUnit: number;

    @IsOptional()
    @IsObject()
    biochemParams?: Record<string, number>;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    county?: string;

    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @IsOptional()
    @IsDateString()
    availableTo?: string;
}

export class UpdateListingDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    @Min(0.01)
    quantity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0.01)
    pricePerUnit?: number;

    @IsOptional()
    @IsObject()
    biochemParams?: Record<string, number>;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    county?: string;

    @IsOptional()
    @IsEnum(ListingStatus)
    status?: ListingStatus;
}

/** Query DTO for advanced search with JSONB filtering */
export class SearchListingsDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsNumber()
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    maxPrice?: number;

    @IsOptional()
    @IsNumber()
    minProtein?: number;

    @IsOptional()
    @IsNumber()
    maxMoisture?: number;

    @IsOptional()
    @IsNumber()
    minHectoliter?: number;

    @IsOptional()
    @IsString()
    county?: string;

    @IsOptional()
    @IsString()
    sortBy?: string; // 'price_asc', 'price_desc', 'quantity', 'newest'

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
}
