/**
 * DTOs for the Financial Module.
 * Covers Order creation, status updates, and escrow operations.
 */
import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, IsBoolean, IsDateString } from 'class-validator';
import { ContractType, OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
    @IsUUID()
    buyerId: string;

    @IsUUID()
    sellerId: string;

    @IsOptional()
    @IsUUID()
    listingId?: string;

    @IsEnum(ContractType)
    contractType: ContractType;

    @IsString()
    productDescription: string;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    @IsNumber()
    @Min(0.01)
    pricePerUnit: number;

    @IsOptional()
    @IsBoolean()
    reverseCharge?: boolean;

    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    uitCode?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class ProcessRefundDto {
    @IsNumber()
    @Min(0.01)
    refundAmount: number;

    @IsString()
    reason: string;
}
