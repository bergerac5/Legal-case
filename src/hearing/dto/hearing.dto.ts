import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateHearingDto {
  @IsString()
  @IsNotEmpty()
  case_id: string;

  @IsDateString()
  @IsNotEmpty()
  start_time: Date;

  @IsDateString()
  @IsNotEmpty()
  end_time: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateHearingDto {
  @IsDateString()
  @IsOptional()
  start_time?: Date;

  @IsDateString()
  @IsOptional()
  end_time?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
