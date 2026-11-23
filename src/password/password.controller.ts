import { Body, Controller, Patch, Post } from '@nestjs/common';
import { PasswordService } from './password.service';
import { ChangePasswordDto } from './dtos/ChangePasswordDto';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/middlewares/roles.decorator';
import { RolesGuard } from '../auth/middlewares/roles.guard';
import { JwtAuthGuard } from 'src/auth/middlewares/jwt-auth.guard';
import { ResetPasswordDto } from './dtos/resetPasswordDto';
import { Public } from '../auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Patch('change')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.passwordService.changePassword(dto.email, dto);
  }

  @Patch('change-before-expire')
  async changePasswordBeforeExpire(@Body() dto: ChangePasswordDto) {
    return this.passwordService.changePasswordBeforeExpire(dto.email, dto);
  }

  @Public()
  @Post('reset-password')
  async resetUserPassword(@Body() dto: ChangePasswordDto) {
    return this.passwordService.resetUserPassword(dto.email, dto);
  }

  @Post('reset')
  @Roles('Admin')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordService.resetPassword(dto.email);
  }
}
