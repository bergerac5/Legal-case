import { IsEnum } from 'class-validator';
import { CaseStatus } from '../case-status.enum';
export class UpdateCaseStatusDto {
  @IsEnum(CaseStatus)
  status: CaseStatus;
}
