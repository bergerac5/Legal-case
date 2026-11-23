import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { HearingService } from './hearing.service';
import { CreateHearingDto, UpdateHearingDto } from './dto/hearing.dto';

@Controller('hearings')
export class HearingController {
  constructor(private readonly hearingService: HearingService) {}

  @Post()
  async createHearing(@Body() dto: CreateHearingDto) {
    return this.hearingService.createHearing(dto);
  }

  @Get()
  async getAllHearings(@Query('caseId') caseId?: string) {
    if (caseId) {
      return this.hearingService.findHearingsByCaseId(caseId);
    }
    return this.hearingService.findAllHearings();
  }

  @Get(':id')
  async getHearing(@Param('id') id: string) {
    return this.hearingService.findHearingById(id);
  }

  @Patch(':id')
  async updateHearing(@Param('id') id: string, @Body() dto: UpdateHearingDto) {
    return this.hearingService.updateHearing(id, dto);
  }

  @Delete(':id')
  async deleteHearing(@Param('id') id: string) {
    return this.hearingService.deleteHearing(id);
  }
}
