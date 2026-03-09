/**
 * DTOs for the Dispute (ADR) Module.
 */
import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsObject, Min, Max } from 'class-validator';
import { DisputeReason } from '../entities/dispute.entity';

export class OpenDisputeDto {
    @IsUUID()
    orderId: string;

    @IsEnum(DisputeReason)
    reason: DisputeReason;

    @IsString()
    description: string;

    @IsOptional()
    @IsObject()
    contractedParams?: Record<string, number>;

    @IsOptional()
    @IsObject()
    receivedParams?: Record<string, number>;
}

export class SendMessageDto {
    @IsString()
    content: string;
}

export class ProposeResolutionDto {
    @IsNumber()
    @Min(0.01)
    @Max(100)
    refundPercent: number;

    @IsOptional()
    @IsString()
    message?: string;
}

export class AcceptResolutionDto {
    @IsOptional()
    @IsString()
    message?: string;
}
