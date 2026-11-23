
import { Controller, Post, Body, Get, UseGuards, Param, Patch, ParseUUIDPipe } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dtos';
import { RolesGuard } from 'src/auth/middlewares/roles.guard';
import { JwtAuthGuard } from 'src/auth/middlewares/jwt-auth.guard';
import { Roles } from 'src/auth/middlewares/roles.decorator';

import { UpdateUserDto } from './dtos/update-user.dtos';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async getActiveUsers() {
    return this.usersService.findActiveUsers();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('lawyers')
  async getLawyers() {
    return this.usersService.getLawyers();
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin','Lawyer','Manager')
  async getUserById(@Param('id') id: string) {

  return this.usersService.findUserById(id);
}


  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin','Lawyer','Manager')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
