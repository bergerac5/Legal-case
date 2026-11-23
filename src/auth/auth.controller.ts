// auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth-user.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dtos';
import { ResendOtpDto } from './dtos/resend-otp.dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* @Post('login')
  login(@Body() body: { authDto: AuthDto }) {
    return this.authService.login(body.authDto);
  }*/
  @Post('login')
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
  @Post('resend-otp')
  async resendOtp(@Body() resendOtp: ResendOtpDto) {
    return this.authService.resendOtp(resendOtp);
  }
}
