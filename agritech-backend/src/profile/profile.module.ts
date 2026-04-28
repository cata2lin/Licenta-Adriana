import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../iam/entities/user.entity';
import { Company } from '../iam/entities/company.entity';
import { Review } from './entities/review.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Company, Review]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'super-secret-key-for-dev'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule { }
