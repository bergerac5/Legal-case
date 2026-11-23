import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateFullClaimDto } from './dtos/client-claim.dtos';
import { UpdateClaimProgressDto } from './dtos/update-claim-progress.dto';
import { CreateResultDto } from './dtos/create-result.dto';
import { ClientDto } from './dtos/ClientDto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: DatabaseService) { }

  // --- Insurance Claim Logic ---
  async createClientClaim(dto: CreateFullClaimDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingClient = await tx.client.findUnique({
          where: { poc: dto.client.poc },
        });

        if (existingClient)
          throw new ConflictException(
            `A client with poc ${dto.client.poc} already exists.`,
          );

        const existingPhone = await tx.client.findUnique({
          where: { phoneNumber: dto.client.phoneNumber },
        });


        if (existingPhone) {
          throw  {
            statusCode: 400,
            type: 'PHONE_CONFLICT',
            message: `A client with phone number ${dto.client.phoneNumber} already exists.`,
          };
        }


        const client = await tx.client.create({
          data: dto.client,
        });

        const claim = await tx.insuranceClaim.create({
          data: {
            type: dto.type,
            dateOfClaim: new Date(dto.dateOfClaim),
            description: dto.description,
            claimAmount: dto.claimAmount,
            claimProgress: dto.claimProgress,
          },
        });

        const damageDetails = dto.damagedItems.map((item) => ({
          itemName: item.itemName,
          claim_id: claim.id,
        }));

        await tx.damageDetail.createMany({ data: damageDetails });

        await tx.clientClaim.create({
          data: {
            client_id: client.id,
            claim_id: claim.id,
          },
        });

        return {
          status: 'success',
          message: 'Client claim successfully submitted.',
          client,
          claimId: claim.id,
        };
      });
    } catch (error) {
      if (typeof error === 'object' && error?.message) {
        return {
          status: 'error',
          error: {
            type: error.type || 'UNKNOWN_ERROR',
            message: error.message,
          },
        };
      }
    }
  }

  async getClientClaimDetails(claim_id: string) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id: claim_id },
      include: {
        result: true,
        damageDetails: true,
        clientClaims: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!claim) throw new NotFoundException('Claim not found');

    const client = claim.clientClaims[0]?.client;

    return {
      claimId: claim.id,
      type: claim.type,
      dateOfClaim: claim.dateOfClaim,
      description: claim.description,
      claimAmount: claim.claimAmount,
      claimProgress: claim.claimProgress,
      client,
      damagedItems: claim.damageDetails,
      result: claim.result,
    };
  }

  async getAllClientClaims(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.insuranceClaim.findMany({
        where: { type: 'Client' },
        include: {
          damageDetails: true,
          clientClaims: {
            include: {
              client: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.insuranceClaim.count({ where: { type: 'Client' } }),
    ]);

    return {
      data: data.map((claim) => ({
        claimId: claim.id,
        type: claim.type,
        dateOfClaim: claim.dateOfClaim,
        description: claim.description,
        claimAmount: claim.claimAmount,
        claimProgress: claim.claimProgress,
        damagedItems: claim.damageDetails,
        client: claim.clientClaims.map((clientClaim) => ({
          names: clientClaim.client.names,
          poc: clientClaim.client.poc,
          phoneNumber: clientClaim.client.phoneNumber,
          address: clientClaim.client.address,
        })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateClaimProgress(id: string, dto: UpdateClaimProgressDto) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    const updatedClaim = await this.prisma.insuranceClaim.update({
      where: { id },
      data: { claimProgress: dto.claimProgress },
    });

    return {
      message: 'Claim progress updated successfully',
      claim: updatedClaim,
    };
  }

  async getClaimSummaryByType() {
    const [clientPending, clientCompleted, clientFailed, clientTotal] =
      await this.prisma.$transaction([
        this.prisma.insuranceClaim.count({
          where: { type: 'Client', claimProgress: 'PENDING' },
        }),
        this.prisma.insuranceClaim.count({
          where: { type: 'Client', claimProgress: 'COMPLETED' },
        }),
        this.prisma.insuranceClaim.count({
          where: { type: 'Client', claimProgress: 'FAILED' },
        }),
        this.prisma.insuranceClaim.count({ where: { type: 'Client' } }),
      ]);

    const [regPending, regCompleted, regFailed, regTotal] =
      await this.prisma.$transaction([
        this.prisma.insuranceClaim.count({
          where: { type: 'REG', claimProgress: 'PENDING' },
        }),
        this.prisma.insuranceClaim.count({
          where: { type: 'REG', claimProgress: 'COMPLETED' },
        }),
        this.prisma.insuranceClaim.count({
          where: { type: 'REG', claimProgress: 'FAILED' },
        }),
        this.prisma.insuranceClaim.count({ where: { type: 'REG' } }),
      ]);

    return {
      Client: {
        pending: clientPending,
        completed: clientCompleted,
        failed: clientFailed,
        total: clientTotal,
      },
      REG: {
        pending: regPending,
        completed: regCompleted,
        failed: regFailed,
        total: regTotal,
      },
    };
  }

  async createResult(dto: CreateResultDto) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id: dto.claimId },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    const existingResult = await this.prisma.result.findUnique({
      where: { claimId: dto.claimId },
    });
    if (existingResult)
      throw new BadRequestException('Result already exists for this claim');

    return await this.prisma.result.create({
      data: {
        decision: dto.decision,
        reason: dto.reason,
        amountApproved: dto.amountApproved,
        claimId: dto.claimId,
      },
    });
  }

  // --- Case Management Logic ---

  async createClient(dto: ClientDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { poc: dto.poc },
    });
    if (existingClient)
      throw new ConflictException('A client with this poc already exists');
    const existingPhone = await this.prisma.client.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existingPhone)
      throw new ConflictException(
        'A client with this PhoneNumber already exists',
      );
    await this.prisma.client.create({ data: { ...dto } });

    return { message: 'Client created successfully' };
  }

  async findAllClient(skip = 0, take = 5) {
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        skip,
        take,
        orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
        include: {
          cases: {
            include: {
              lawyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.client.count(),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
async findClientsByLawyer(lawyerId: string, skip = 0, take = 5) {
  const [clients, total] = await Promise.all([
    this.prisma.client.findMany({
      skip,
      take,
      where: {
        cases: {
          some: {
            lawyer_id: lawyerId
          }
        }
      },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
      include: {
        cases: {
          where: {
            lawyer_id: lawyerId
          },
          include: {
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    this.prisma.client.count({
      where: {
        cases: {
          some: {
            lawyer_id: lawyerId
          }
        }
      }
    }),
  ]);

  return {
    data: clients,
    meta: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

async findClientByLawyer(lawyerId: string, clientId: string) {
  const client = await this.prisma.client.findFirst({
    where: {
      id: clientId,
      cases: {
        some: {
          lawyer_id: lawyerId,
        },
      },
    },
    include: {
      cases: {
        where: { lawyer_id: lawyerId },
        include: {
          lawyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!client) {
    throw new NotFoundException('Client not found or not assigned to the lawyer');
  }

  return client;
}

  async getClientById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async updateClient(id: string, dto: ClientDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!existingClient) throw new NotFoundException('Client not found');

    if (dto.poc && dto.poc !== existingClient.poc) {
      const pocConflict = await this.prisma.client.findUnique({
        where: { poc: dto.poc },
      });
      if (pocConflict)
        throw new ConflictException('poc already in use by another client');
    }

    await this.prisma.client.update({
      where: { id },
      data: { ...dto, updated_at: new Date() },
    });

    return { message: 'Client Updated successfully' };
  }

  async deleteClient(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    await this.prisma.client.delete({ where: { id } });

    return { message: 'Client deleted successfully' };
  }

  async findClientByPoc(poc: string): Promise<{ id: string; names: string }> {
    const client = await this.prisma.client.findUnique({
      where: { poc },
      select: { id: true, names: true },
    });

    if (!client)
      throw new NotFoundException('Client not found with the specified POC');

    return client;
  }
}
