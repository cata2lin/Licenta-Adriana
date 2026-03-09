import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ─── Domain Modules (DDD — 100% Isolated) ───
import { IamModule } from './iam/iam.module';
import { TradingModule } from './trading/trading.module';
import { FinancialModule } from './financial/financial.module';
import { TransportModule } from './transport/transport.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfileModule } from './profile/profile.module';

// ─── Entities (for TypeORM global registration) ───
import { User } from './iam/entities/user.entity';
import { Company } from './iam/entities/company.entity';
import { Commodity } from './trading/entities/commodity.entity';
import { Listing } from './trading/entities/listing.entity';
import { ForwardContract } from './trading/entities/forward-contract.entity';
import { Order, EscrowPayment } from './financial/entities/order.entity';
import { Shipment } from './transport/entities/shipment.entity';
import { Dispute, DisputeMessage } from './disputes/entities/dispute.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'agritech_db'),
        entities: [
          // IAM
          User, Company,
          // Trading
          Commodity, Listing, ForwardContract,
          // Financial
          Order, EscrowPayment,
          // Transport
          Shipment,
          // Disputes
          Dispute, DisputeMessage,
          // Notifications
          Notification,
        ],
        synchronize: true, // DEV ONLY: auto-create tables
      }),
    }),
    // Domain modules — each is fully isolated
    IamModule,
    TradingModule,
    FinancialModule,
    TransportModule,
    DisputesModule,
    NotificationsModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

