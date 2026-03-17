/**
 * Trading Module — Catalog, Spot Market & Forward Contracts
 * 
 * 100% isolated module. Manages commodities dictionary, spot market listings,
 * and forward contracts for physical delivery.
 * Does NOT import from Financial, Transport, or Dispute modules.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Commodity } from './entities/commodity.entity';
import { Listing } from './entities/listing.entity';
import { ForwardContract } from './entities/forward-contract.entity';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { ForwardContractService } from './services/forward-contract.service';
import { ForwardContractController } from './controllers/forward-contract.controller';
import { AnalyticsController } from './analytics.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Commodity, Listing, ForwardContract]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [TradingController, ForwardContractController, AnalyticsController],
    providers: [TradingService, ForwardContractService],
    exports: [TradingService, ForwardContractService],
})
export class TradingModule { }
