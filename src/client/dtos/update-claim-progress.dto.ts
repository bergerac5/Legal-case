import { IsEnum } from 'class-validator';

export class UpdateClaimProgressDto {
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED'], {
    message: 'claimProgress must be PENDING, COMPLETED, or FAILED',
  })
  claimProgress: 'PENDING' | 'COMPLETED' | 'FAILED';
}
