/**
 * Transport Module — Routing, Shipping & Compliance
 * 
 * 100% isolated module. Manages shipment lifecycle, OSRM routing, and transport bidding.
 * Does NOT import from Trading or Financial modules directly.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Shipment } from './entities/shipment.entity';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { MapsController } from './maps.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shipment]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [TransportController, MapsController],
    providers: [TransportService],
    exports: [TransportService],
})
export class TransportModule { }
