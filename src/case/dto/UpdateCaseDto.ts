import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CaseStatus } from '../case-status.enum';

export class UpdateCaseDto {
  @IsString()
  @IsOptional()
  classification?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsEnum(CaseStatus)
  status: CaseStatus;

  @IsString()
  @IsOptional()
  lawyer_id?: string;
}
