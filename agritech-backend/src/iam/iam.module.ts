import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [IamService],
})
export class IamModule { }
