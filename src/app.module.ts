import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PasswordModule } from './password/password.module';
import { ClientModule } from './client/client.module';
import { PropertyModule } from './property/property.module';
import { CaseModule } from './case/case.module';
import { DocumentModule } from './document/document.module';
import { HearingModule } from './hearing/hearing.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    DatabaseModule,
    RoleModule,
    UsersModule,
    AuthModule,
    PasswordModule,
    ClientModule,
    PropertyModule,
    CaseModule,
    DocumentModule,
    HearingModule,
    CloudinaryModule,
  ],
  controllers: [AppController, RoleController],
  providers: [AppService, RoleService],
})
export class AppModule {}
