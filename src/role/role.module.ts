import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule], // Import DatabaseModule to make DatabaseService available
  providers: [RoleService],
  exports: [RoleService], // Export RoleService for use in other modules
})
export class RoleModule {}
