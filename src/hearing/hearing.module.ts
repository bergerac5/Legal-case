// src/hearing/hearing.module.ts
import { Module } from '@nestjs/common';
import { HearingService } from './hearing.service';
import { HearingController } from './hearing.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HearingController],
  providers: [HearingService],
})
export class HearingModule {}
