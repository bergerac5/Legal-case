import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEnum,
} from 'class-validator';
import { CaseStatus } from '../case-status.enum';

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  classification: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  lawyer_id: string;
}
