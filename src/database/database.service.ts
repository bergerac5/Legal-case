// Import necessary decorators and interfaces from NestJS
import { Injectable, OnModuleInit } from '@nestjs/common';
// Import PrismaClient to interact with the database
import { PrismaClient } from '@prisma/client';

// Mark this class as a provider that can be injected into other classes
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  // Lifecycle hook that runs when the module is initialized
  async onModuleInit() {
    // Connect to the database using Prisma
    await this.$connect();
  }
}
