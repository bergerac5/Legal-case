import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PropertyDto } from './dtos/property.dtos';
import { PropertyClaimDto } from './dtos/property-claim.dtos';

@Injectable()
export class PropertyService {
  constructor(private prisma: DatabaseService) {}

  async registerProperty(propertyDto: PropertyDto) {
    //Register property
    const property = await this.prisma.property.create({
      data: {
        name: propertyDto.name,
        price: propertyDto.price,
        department: propertyDto.department,
        location: propertyDto.location,
        boughtTime: propertyDto.boughtTime,
        manufacturer: propertyDto.manufacturer,
        status: propertyDto.status,
        supplier: propertyDto.supplier,
      },
    });
    return {
      message: 'Property Registered Successfully',
      data: property,
    };
  }
  //get All property with pagination
  async GetAllProperty(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' }, // optional: consistent sorting
      }),
      this.prisma.property.count(),
    ]);

    if (!data || data.length === 0) {
      throw new NotFoundException('No Properties Registered');
    }

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  //Get Single Property by its Id
  async getPropertyById(id: string) {
    const singleProperty = await this.prisma.property.findUnique({
      where: { id },
    });
    if (!singleProperty) {
      throw new NotFoundException('Property Not found');
    }
    return singleProperty;
  }

  // Claiming insurance for a damaged property
  async propertyInsuranceClaim(claimProperty: PropertyClaimDto) {
    // Check if the property exists
    const property = await this.prisma.property.findUnique({
      where: { id: claimProperty.property_id },
    });

    if (!property) {
      throw new NotFoundException('Property with the given ID does not exist');
    }

    // Create the property claim
    const createdClaim = await this.prisma.insuranceClaim.create({
      data: {
        type: claimProperty.type,
        claimProgress: claimProperty.claimProgress,
        dateOfClaim: claimProperty.dateOfClaim,
        property_id: claimProperty.property_id,
        description: claimProperty.description,
        claimAmount: claimProperty.claimAmount,
      },
    });

    // Update the property's status to false (damaged)
    await this.prisma.property.update({
      where: { id: claimProperty.property_id },
      data: { status: false },
    });

    return {
      message: 'Claim submitted Successfully',
      data: createdClaim,
    };
  }

  async allPropertyInsuranceClaim(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.insuranceClaim.findMany({
        where: { type: 'REG' },
        include: { property: true },
        orderBy: { dateOfClaim: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.insuranceClaim.count({
        where: { type: 'REG' },
      }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async singleInsuranceClaim(claim_id: string) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id: claim_id },
      include: {
        property: true,
        result: true,
      },
    });

    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    return claim;
  }
}
