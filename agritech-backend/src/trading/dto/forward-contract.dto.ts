/**
 * Forward Contracts DTO
 */
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateForwardContractDto {
    @IsString()
    commodityName: string;

    @IsOptional()
    @IsString()
    commodityId?: string;

    @IsString()
    buyerName: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(1)
    pricePerTon: number;

    @IsDateString()
    deliveryDate: string;
}

export class UpdateForwardContractStatusDto {
    @IsString()
    status: string;
}
