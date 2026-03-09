/**
 * Financial Module — Orders, Escrow, Split Payments, DAC7 & Chargeback
 * 
 * 100% isolated module. Manages order lifecycle, escrow payments,
 * DAC7 F7000 annual reporting, and chargeback routing.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Order, EscrowPayment } from './entities/order.entity';
import { FinancialService } from './financial.service';
import { DAC7Service } from './dac7.service';
import { FinancialController } from './financial.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, EscrowPayment]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [FinancialController],
    providers: [FinancialService, DAC7Service],
    exports: [FinancialService, DAC7Service],
})
export class FinancialModule { }
