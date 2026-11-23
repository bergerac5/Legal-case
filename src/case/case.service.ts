import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCaseDto } from './dto/CreateCaseDto';
import { UpdateCaseDto } from './dto/UpdateCaseDto';
import { CaseStatus } from '@prisma/client';

@Injectable()
export class CaseService {
  constructor(private prisma: DatabaseService) {}

  // Create a new case
  async createCase(dto: CreateCaseDto) {
    // Verify client exists
    const clientExists = await this.prisma.client.findUnique({
      where: { id: dto.client_id },
    });
    if (!clientExists) {
      throw new NotFoundException('Client not found');
    }

    // Verify lawyer exists
    const lawyerExists = await this.prisma.user.findUnique({
      where: { id: dto.lawyer_id },
    });
    if (!lawyerExists) {
      throw new NotFoundException('Lawyer not found');
    }

    const createdCase = await this.prisma.case.create({
      data: {
        classification: dto.classification,
        type: dto.type,
        status: dto.status ?? CaseStatus.open,
        client_id: dto.client_id,
        lawyer_id: dto.lawyer_id,
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    return {
      message: 'Case created successfully',
      data: createdCase,
    };
  }

  // Get all cases
  async findAllCases(skip: number = 0, take: number = 7) {
    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        skip,
        take,
        include: {
          client: {
            select: {
              id: true,
              names: true,
              phoneNumber: true,
              address: true,
            },
          },
          lawyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          hearings: {
            select: {
              id: true,
              start_time: true,
              end_time: true,
              notes: true,
            },
            orderBy: {
              start_time: 'asc',
            },
          },
          documents: {
            select: {
              id: true,
              filename: true,
            },
            orderBy: {
              uploaded_at: 'desc',
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      }),
      this.prisma.case.count(),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // Get a single case by ID
  async findCaseById(id: string) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        lawyer: true,
        hearings: true,
        documents: true,
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    return caseRecord;
  }

  // Update a case
  async updateCase(id: string, dto: UpdateCaseDto) {
    // Remove status from parameters
    // Verify case exists
    const existingCase = await this.prisma.case.findUnique({
      where: { id },
    });
    if (!existingCase) {
      throw new NotFoundException('Case not found');
    }

    // Verify new lawyer exists if being updated
    if (dto.lawyer_id) {
      const lawyerExists = await this.prisma.user.findUnique({
        where: { id: dto.lawyer_id },
      });
      if (!lawyerExists) {
        throw new NotFoundException('Lawyer not found');
      }
    }

    await this.prisma.case.update({
      where: { id },
      data: {
        classification: dto.classification,
        type: dto.type,
        status: dto.status,
        lawyer_id: dto.lawyer_id,
        updated_at: new Date(),
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    return {
      message: 'Case updated successfully',
    };
  }

  // Delete a case
  async deleteCase(id: string) {
    // Verify case exists
    const caseExists = await this.prisma.case.findUnique({
      where: { id },
    });
    if (!caseExists) {
      throw new NotFoundException('Case not found');
    }

    await this.prisma.case.delete({
      where: { id },
    });

    return {
      message: 'Case deleted successfully',
    };
  }

  // Get cases by client ID
  async findCasesByClientId(clientId: string) {
    return this.prisma.case.findMany({
      where: { client_id: clientId },
      include: {
        lawyer: true,
        hearings: true,
      },
    });
  }

  // Get cases by lawyer ID
async findCasesByLawyerId(
  lawyerId: string,
  page: number = 1,
  limit: number = 5
) {
  if (page < 1) throw new Error('Page must be greater than 0');
  if (limit < 1 || limit > 100)
    throw new Error('Limit must be between 1 and 100');

  const skip = (page - 1) * limit;

  const [cases, total] = await Promise.all([
    this.prisma.case.findMany({
      where: { lawyer_id: lawyerId },
      skip,
      take: limit,
      include: {
        client: true,
        lawyer: true,
      },
    }),
    this.prisma.case.count({
      where: { lawyer_id: lawyerId },
    }),
  ]);

  return {
    data: cases,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


  // Update case status
  async updateCaseStatus(id: string, status: CaseStatus) {
    await this.prisma.case.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Status updated successfully',
    };
  }

  //find client by poc
  async findClientByPoc(poc: string): Promise<{ id: string; names: string }> {
    const client = await this.prisma.client.findUnique({
      where: { poc },
      select: {
        id: true,
        names: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found with the specified POC');
    }

    return client;
  }
}
