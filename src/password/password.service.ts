import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { sendEmail } from 'src/mailer/send-mail';
import { renderTemplate } from 'src/mailer/renderTemplate';
import { ChangePasswordDto } from './dtos/ChangePasswordDto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async changePassword(userEmail: string, dto: ChangePasswordDto) {
    const { old_password, new_password, confirm_new_password } = dto;
    // Add this check to prevent using the same password
    if (old_password === new_password) {
      throw new BadRequestException(
        'New password cannot be the same as old password',
      );
    }
    //validate password similarity
    if (new_password !== confirm_new_password) {
      throw new BadRequestException('New passwords do not match');
    }

    //find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    // if user not exist
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // campare password
    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user password
    await this.prisma.user.update({
      where: { email: userEmail },
      data: {
        password_hash: hashedPassword,
        is_default_password: false,
        password_expires_at: this.calculatePasswordExpiry(),
      },
    });

    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      text: `Hello ${user.name},
          
          Your password has been changed successfully.
          You should change your password before ${user.password_expires_at}          
          If this was not you, please contact our support team immediately.
          
          Thank you,
          Support Team`,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async resetPassword(userEmail: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new default password
    const defaultPassword = this.generateStrongPassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const password_expires_at = this.calculatePasswordExpiry();
    // Update user with new password & set is_default_password = true
    await this.prisma.user.update({
      where: { email: userEmail },
      data: {
        password_hash: hashedPassword,
        is_default_password: true,
        password_expires_at,
      },
    });

    const html = renderTemplate('reset-password.html', {
      name: user.name,
      defaultPassword: defaultPassword,
      password_expires_at: password_expires_at.toLocaleString(), // ✅ convert to string
      year: new Date().getFullYear(),
    });

    // Send email to user
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successfully',
      text: `Hello ${user.name},

Your password has been reset successfully.
Temporary Password: ${defaultPassword}
You should change your password before ${password_expires_at.toLocaleString()}

If this was not you, please contact our support team immediately.

Thank you,
Support Team`,
      html,
    });

    return { message: 'Password reset successfully and sent to user email' };
  }

  async resetUserPassword(userEmail: string, dto: ChangePasswordDto) {
    const { old_password, new_password, confirm_new_password } = dto;

    if (new_password !== confirm_new_password) {
      throw new BadRequestException('New passwords do not match');
    }

    // Add this check to prevent using the same password
    if (old_password === new_password) {
      throw new BadRequestException(
        'New password cannot be the same as old password',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const password_expires_at = this.calculatePasswordExpiry();

    await this.prisma.user.update({
      where: { email: userEmail },
      data: {
        password_hash: hashedPassword,
        is_default_password: false,
        password_expires_at,
      },
    });

    const html = renderTemplate('change-password.html', {
      name: user.name,
      password_expires_at: password_expires_at.toLocaleString(), // ✅ convert to string
      year: new Date().getFullYear(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      text: `Hello  ${user.name},

                Your default password has been changed successfully before expiry.
                You should change your password before ${password_expires_at.toLocaleString()} 

                If this was not you, please contact our support team immediately.

                Thank you,
                Support Team`,
      html,
    });

    return { message: 'Password changed successfully' };
  }

  async changePasswordBeforeExpire(userEmail: string, dto: ChangePasswordDto) {
    const { old_password, new_password, confirm_new_password } = dto;

    if (new_password !== confirm_new_password) {
      throw new BadRequestException('New passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const password_expires_at = this.calculatePasswordExpiry();

    await this.prisma.user.update({
      where: { email: userEmail },
      data: {
        password_hash: hashedPassword,
        is_default_password: false,
        password_expires_at,
      },
    });

    const html = renderTemplate('change-password.html', {
      name: user.name,
      password_expires_at: password_expires_at.toLocaleString(), // ✅ convert to string
      year: new Date().getFullYear(),
    });

    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      text: `Hello ${user.name},

Your password has been changed successfully before expiry.

Your new password will expire at ${password_expires_at.toLocaleString()}.

If this was not you, please contact our support team immediately.

Thank you,
Support Team`,
      html,
    });

    return { message: 'Password changed successfully before expiry' };
  }

  private calculatePasswordExpiry(): Date {
    const expiryDays =
      this.configService.get<number>('PASSWORD_EXPIRY_DAYS') || 90;
    const now = new Date();
    now.setDate(now.getDate() + expiryDays);
    return now;
  }

  generateStrongPassword(): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}
