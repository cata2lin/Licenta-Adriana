/**
 * Disputes Module — Quality Disputes & ADR Resolution
 * 
 * Isolated module for Legea 81/2022 compliance.
 * Only cross-module dependency: reads/writes Order status from Financial entities.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dispute, DisputeMessage } from './entities/dispute.entity';
import { Order } from '../financial/entities/order.entity';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dispute, DisputeMessage, Order]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [DisputesController],
    providers: [DisputesService],
    exports: [DisputesService],
})
export class DisputesModule { }
