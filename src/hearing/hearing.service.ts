import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateHearingDto, UpdateHearingDto } from './dto/hearing.dto';

@Injectable()
export class HearingService {
  constructor(private prisma: DatabaseService) {}

  async createHearing(dto: CreateHearingDto) {
    // Verify case exists
    const caseExists = await this.prisma.case.findUnique({
      where: { id: dto.case_id },
    });

    if (!caseExists) {
      throw new NotFoundException('Case not found');
    }

    await this.prisma.hearing.create({
      data: {
        case_id: dto.case_id,
        start_time: dto.start_time,
        end_time: dto.end_time,
        location: dto.location,
        notes: dto.notes,
      },
      include: {
        case: true,
      },
    });

    return {
      message: 'Hearing scheduled successfully',
    };
  }

  async findAllHearings() {
    return this.prisma.hearing.findMany({
      include: {
        case: true,
      },
    });
  }

  async findHearingsByCaseId(caseId: string) {
    return this.prisma.hearing.findMany({
      where: { case_id: caseId },
      include: {
        case: true,
      },
    });
  }

  async findHearingById(id: string) {
    const hearing = await this.prisma.hearing.findUnique({
      where: { id },
      include: {
        case: true,
      },
    });

    if (!hearing) {
      throw new NotFoundException('Hearing not found');
    }

    return hearing;
  }

  async updateHearing(id: string, dto: UpdateHearingDto) {
    const existingHearing = await this.prisma.hearing.findUnique({
      where: { id },
    });

    if (!existingHearing) {
      throw new NotFoundException('Hearing not found');
    }

    await this.prisma.hearing.update({
      where: { id },
      data: {
        start_time: dto.start_time,
        end_time: dto.end_time,
        location: dto.location,
        notes: dto.notes,
      },
      include: {
        case: true,
      },
    });

    return {
      message: 'Hearing updated successfully',
    };
  }

  async deleteHearing(id: string) {
    const hearing = await this.prisma.hearing.findUnique({
      where: { id },
    });

    if (!hearing) {
      throw new NotFoundException('Hearing not found');
    }

    await this.prisma.hearing.delete({
      where: { id },
    });

    return {
      message: 'Hearing deleted successfully',
    };
  }
}
