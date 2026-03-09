/**
 * DTOs for the Transport Module.
 * Covers shipment creation, route calculation, status updates, and bidding.
 */
import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, IsDateString } from 'class-validator';
import { ShipmentStatus } from '../entities/shipment.entity';

export class CreateShipmentDto {
    @IsOptional()
    @IsUUID()
    orderId?: string;

    @IsString()
    originAddress: string;

    @IsOptional()
    @IsString()
    originCounty?: string;

    @IsString()
    destAddress: string;

    @IsOptional()
    @IsString()
    destCounty?: string;

    @IsString()
    cargoDescription: string;

    @IsNumber()
    @Min(0.1)
    weightTonnes: number;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsOptional()
    @IsDateString()
    pickupDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CalculateRouteDto {
    @IsString()
    origin: string;

    @IsString()
    destination: string;

    @IsOptional()
    @IsNumber()
    weightTonnes?: number;
}

export class UpdateShipmentStatusDto {
    @IsEnum(ShipmentStatus)
    status: ShipmentStatus;

    @IsOptional()
    @IsString()
    uitCode?: string;

    @IsOptional()
    @IsUUID()
    transporterId?: string;

    @IsOptional()
    @IsNumber()
    transporterScore?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class AssignTransporterDto {
    @IsUUID()
    transporterId: string;

    @IsNumber()
    @Min(0.01)
    agreedRate: number;

    @IsOptional()
    @IsNumber()
    transporterScore?: number;
}
