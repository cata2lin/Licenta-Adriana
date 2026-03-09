import { IsString, IsEmail, MinLength, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
    @IsEmail()
    email: string;

    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    fullName: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    // Company related fields (Optional if the user belongs to an existing company, Required if creating a new one)
    @ValidateIf(o => o.role === UserRole.FARMER || o.role === UserRole.CORPORATE_BUYER || o.role === UserRole.TRANSPORTER)
    @IsString()
    cui?: string;

    @ValidateIf(o => !!o.cui)
    @IsString()
    companyName?: string;

    @ValidateIf(o => !!o.cui)
    @IsString()
    legalAddress?: string;
}
