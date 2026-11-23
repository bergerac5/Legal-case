import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { RoleModule } from 'src/role/role.module';
import { RolesGuard } from 'src/auth/middlewares/roles.guard';

@Module({
  imports: [RoleModule, DatabaseModule], // Import RoleModule to make RoleService available
  providers: [UsersService, RolesGuard], // Include RolesGuard in the providers

  controllers: [UsersController],
})
export class UsersModule {}
