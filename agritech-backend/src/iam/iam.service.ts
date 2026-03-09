import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Company, KycStatus } from './entities/company.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class IamService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Mocking the Romanian ANAF/VIES API check.
     * Scans if the CUI (Company Unique Identifier) is legally registered and active.
     */
    async validateAnafCui(cui: string): Promise<boolean> {
        // In a production environment, implement HTTP request to https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva
        // We return true immediately as a mock validation.
        if (!cui || cui.length < 5) return false;
        return true;
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new BadRequestException('User with this email already exists.');
        }

        let company = null;

        if (registerDto.cui) {
            const isAnafValid = await this.validateAnafCui(registerDto.cui);
            if (!isAnafValid) {
                throw new BadRequestException('Invalid CUI. The company is not active at ANAF/VIES.');
            }

            company = await this.companyRepository.findOne({ where: { cui: registerDto.cui } });

            if (!company) {
                company = this.companyRepository.create({
                    cui: registerDto.cui,
                    companyName: registerDto.companyName,
                    legalAddress: registerDto.legalAddress,
                    kycStatus: KycStatus.VERIFIED, // ANAF verified
                });
                company = await this.companyRepository.save(company);
            }
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const user = this.userRepository.create({
            email: registerDto.email,
            passwordHash,
            fullName: registerDto.fullName,
            role: registerDto.role,
            phoneNumber: registerDto.phoneNumber,
            company: company,
        });

        await this.userRepository.save(user);

        return { message: 'Registration successful', userId: user.id };
    }

    async login(loginDto: any) {
        const user = await this.userRepository.findOne({ where: { email: loginDto.email }, relations: ['company'] });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: user.company?.id,
            kycStatus: user.company?.kycStatus
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
