import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateResultDto {
  @IsUUID()
  @IsNotEmpty()
  claimId: string;

  @IsString()
  @IsNotEmpty()
  decision: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  amountApproved?: number;
}
