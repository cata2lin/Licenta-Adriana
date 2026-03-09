import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IamService } from './iam.service';
import { RegisterDto } from './dto/register.dto';

@Controller('iam')
export class IamController {
    constructor(private readonly iamService: IamService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.iamService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: any) {
        return this.iamService.login(loginDto);
    }
}
