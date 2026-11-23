import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  is_default_password?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  OTP_number: string;

  @IsDateString()
  @IsOptional()
  OTP_life_time: string;

  @IsOptional()
  @IsDateString()
  last_login?: string;

  @IsUUID()
  role_id: string;

  @IsOptional()
  @IsString()
  created_by?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;
}
