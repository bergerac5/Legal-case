import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ClaimProgress {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export enum ClentType {
  Client = 'Client',
  REG = 'REG',
}

class ClientDto {
  @IsString()
  @IsNotEmpty()
  names: string;

  @IsNotEmpty()
  @IsString()
  poc: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

class DamageDetailDto {
  @IsNotEmpty()
  @IsString()
  itemName: string;
}

export class CreateFullClaimDto {
  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @IsNotEmpty()
  @IsEnum(ClentType)
  type: ClentType;

  @IsNotEmpty()
  @IsEnum(ClaimProgress)
  claimProgress: ClaimProgress;

  @IsNotEmpty()
  @IsDateString()
  dateOfClaim: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  claimAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageDetailDto)
  damagedItems: DamageDetailDto[];
}
