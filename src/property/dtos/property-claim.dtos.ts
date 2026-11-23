import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum ClaimProgress {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export enum ClentType {
  Client = 'Client',
  REG = 'REG',
}

export class PropertyClaimDto {
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
  property_id: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  claimAmount: number;
}
