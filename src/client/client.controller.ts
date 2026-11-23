import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientDto } from './dtos/ClientDto';
import { CreateFullClaimDto } from './dtos/client-claim.dtos';
import { UpdateClaimProgressDto } from './dtos/update-claim-progress.dto';
import { CreateResultDto } from './dtos/create-result.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async createClient(@Body() dto: ClientDto) {
    try {
      return await this.clientService.createClient(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async getAllClients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number = 5,
  ) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    return this.clientService.findAllClient(skip, limit);
  }

  @Post('claim')
  async createFullClaim(@Body() dto: CreateFullClaimDto) {
    return this.clientService.createClientClaim(dto);
  }

  @Get('summary')
  async getClaimSummary() {
    return this.clientService.getClaimSummaryByType();
  }

  @Get('claims')
  async getAllClientClaims(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.clientService.getAllClientClaims(Number(page), Number(limit));
  }

  @Post('result')
  async createResult(@Body() dto: CreateResultDto) {
    return this.clientService.createResult(dto);
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    try {
      return await this.clientService.getClientById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateClient(@Param('id') id: string, @Body() dto: ClientDto) {
    try {
      return await this.clientService.updateClient(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    try {
      return await this.clientService.deleteClient(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('by-poc/:poc')
  async getClientByPoc(@Param('poc') poc: string) {
    try {
      return await this.clientService.findClientByPoc(poc);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('claims/:claim_id')
  async getClaimDetails(@Param('claim_id') claim_id: string) {
    return this.clientService.getClientClaimDetails(claim_id);
  }

  @Put('claims/update/:id')
  async updateClaimProgress(
    @Param('id') id: string,
    @Body() dto: UpdateClaimProgressDto,
  ) {
    return this.clientService.updateClaimProgress(id, dto);
  }

  @Get('by-lawyer/:lawyerId')
  async getClientsByLawyer(
    @Param('lawyerId') lawyerId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number = 5,
  ) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    return this.clientService.findClientsByLawyer(lawyerId, skip, limit);
  }

  @Get('by-lawyer/:lawyerId/:clientId')
async getClientByLawyer(
  @Param('lawyerId') lawyerId: string,
  @Param('clientId') clientId: string,
) {
  return this.clientService.findClientByLawyer(lawyerId, clientId);
}

}
