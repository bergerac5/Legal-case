import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyDto } from './dtos/property.dtos';
import { PropertyClaimDto } from './dtos/property-claim.dtos';
@Controller('property')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Post('register')
  async createProduct(@Body() dto: PropertyDto) {
    return this.service.registerProperty(dto);
  }

  @Get('all')
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.GetAllProperty(Number(page), Number(limit));
  }

  @Post('claim')
  async claimInsuranceProduct(@Body() dto: PropertyClaimDto) {
    return this.service.propertyInsuranceClaim(dto);
  }

  @Get('allclaim')
  findAllClaim(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.service.allPropertyInsuranceClaim(Number(page), Number(limit));
  }

  @Get(':id')
  async getSingleProperty(@Param('id') id: string) {
    return this.service.getPropertyById(id);
  }
  @Get('single-claim/:id')
  async getSinglePropertyClaim(@Param('id') id: string) {
    return this.service.singleInsuranceClaim(id);
  }
}
