// auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { AuthDto } from './dtos/auth-user.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dtos';
import { ResendOtpDto } from './dtos/resend-otp.dtos';
import { sendEmail } from 'src/mailer/send-mail';
import { renderTemplate } from 'src/mailer/renderTemplate';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (!user) throw new NotFoundException('User Not Found');

    const isMatch = await bcrypt.compare(authDto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Check if must reset password before generate otp code on email
    const mustReset = user.is_default_password;

    if (mustReset) {
      return {
        message: 'Your password is default. Please reset it before it expired.',
        userId: user.id,
        mustReset: true
      };
    }

    const otpValidFor = 5; // minutes
    const OTP_number = Math.floor(100000 + Math.random() * 900000).toString();
    const OTP_life_time = new Date(Date.now() + otpValidFor * 60 * 1000);

    await this.prisma.user.update({
      where: { email: authDto.email },
      data: {
        OTP_number,
        OTP_life_time,
      },
    });

    const html = renderTemplate('otp-verification.html', {
      OTP: OTP_number,
      validMinutes: otpValidFor,
      year: new Date().getFullYear(),
    });

    await sendEmail({
      to: user.email,
      subject: 'OTP Code',
      text: `Your OTP is: ${OTP_number}
  
  This OTP is valid for ${otpValidFor} minutes.
  Do not share this code with anyone. If you did not request it, please ignore this message.
  
  - REG Team`,
      html,
    });

    const maskedEmail = `${user.email[0]}${user.email[1]}..........@${user.email.split('@')[1]}`;

    return {
      message: `Enter 6 digits we sent to ${maskedEmail}`,
      userId: user.id,  // Also include userId here
      mustReset: false
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (
      !user ||
      user.OTP_number !== verifyOtpDto.otp ||
      !user.OTP_life_time || //  check for null first
      user.OTP_life_time < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await this.prisma.user.update({
      where: { email: verifyOtpDto.email },
      data: {
        OTP_number: null,
        OTP_life_time: null,
      },
    });

    /* 5. Fetch role name from Role table using role_id 
    inorder to provide payload contain role name like 'Admin' 
    for protecting needed page*/
    const role = await this.prisma.role.findUnique({
      where: { id: user.role_id },
    });

    // Create JWT token if no reset is required
    const payload = {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
      role: role.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      message: 'OTP verified successfully',
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resendOtpDto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    const otpValidFor = 5; // minutes
    const OTP_number = Math.floor(100000 + Math.random() * 900000).toString();
    const OTP_life_time = new Date(Date.now() + otpValidFor * 60 * 1000);

    await this.prisma.user.update({
      where: { email: resendOtpDto.email },
      data: {
        OTP_number,
        OTP_life_time,
      },
    });

    const html = renderTemplate('otp-verification.html', {
      OTP: OTP_number,
      validMinutes: otpValidFor,
      year: new Date().getFullYear(),
    });

    await sendEmail({
      to: user.email,
      subject: 'New OTP Code',
      text: `Your OTP is: ${OTP_number}
  
  This OTP is valid for ${otpValidFor} minutes.
  Do not share this code with anyone. If you did not request it, please ignore this message.
  
  - REG Team`,
      html,
    });

    return { message: 'OTP resent successfully' };
  }
}
