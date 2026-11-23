import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CaseService } from './case.service';
import { CreateCaseDto } from './dto/CreateCaseDto';
import { UpdateCaseDto } from './dto/UpdateCaseDto';
import { UpdateCaseStatusDto } from './dto/UpdateCaseStatusDto';

@Controller('cases')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // Create new case
  @Post()
  async createCase(@Body() dto: CreateCaseDto) {
    return this.caseService.createCase(dto);
  }

  // Get all cases
  @Get()
  async getAllCases(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number = 5,
  ) {
    // Validate inputs
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    return this.caseService.findAllCases(skip, limit);
  }

  // Get single case
  @Get(':id')
  async getCase(@Param('id') id: string) {
    return this.caseService.findCaseById(id);
  }

  // Update case
  @Patch(':id')
  async updateCase(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.caseService.updateCase(id, dto);
  }

  // Update case status
  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    return this.caseService.updateCaseStatus(id, dto.status);
  }

  // Delete case
  @Delete(':id')
  async deleteCase(@Param('id') id: string) {
    return this.caseService.deleteCase(id);
  }

  // Get cases by lawyer ID with pagination
@Get('lawyer/:lawyerId')
async getCasesByLawyerId(
  @Param('lawyerId') lawyerId: string,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
) {
  if (page < 1) throw new BadRequestException('Page must be greater than 0');
  if (limit < 1 || limit > 100)
    throw new BadRequestException('Limit must be between 1 and 100');

  return this.caseService.findCasesByLawyerId(lawyerId, page, limit);
}

}
