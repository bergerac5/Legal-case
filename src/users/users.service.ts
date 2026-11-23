import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dtos/create-user.dtos';
import { sendEmail } from 'src/mailer/send-mail';
import { renderTemplate } from 'src/mailer/renderTemplate';

@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) { }
  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        is_active: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        role: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const existingUserEmail = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      if (existingUserEmail) {
        throw new ConflictException('Email already exists');
      }

      // Check if phone number already exists
      if (createUserDto.phone) {
        const existingUserPhone = await this.prisma.user.findUnique({
          where: { phone: createUserDto.phone },
        });
        if (existingUserPhone) {
          throw new ConflictException('Phone number already exists');
        }
      }

      // Check if role exists
      const roleExists = await this.prisma.role.findUnique({
        where: { id: createUserDto.role_id },
      });

      if (!roleExists) {
        throw new BadRequestException('Role ID does not exist');
      }

      // Generate strong password and hash it
      const defaultPassword = this.generateStrongPassword();
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create user
      await this.prisma.user.create({
        data: {
          ...createUserDto,
          password_hash: hashedPassword,
        },
      });

      // Send email with password

      const html = renderTemplate('account-created.html', {
        name: createUserDto.name,
        defaultPassword,
        year: new Date().getFullYear(),
      });

      await sendEmail({
        to: createUserDto.email,
        subject: 'Your Account Has Been Created',
        text: `Hello ${createUserDto.name}, Your account has been created. Temporary password: ${defaultPassword}`,
        html,
      });

      return {
        message: 'User created and password sent on your email',
        password: defaultPassword,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        throw new ConflictException('Unique field already exists');
      }

      // Prisma error validation or other errors
      throw new BadRequestException(
        error?.message || 'An error occurred while creating the user',
      );
    }
  }

  // Generate a stronger password (8 characters with a mix of letters, numbers, and symbols)
  generateStrongPassword(): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // Method to get active users
  async findActiveUsers() {
    return await this.prisma.user.findMany({
      where: {
        is_active: true, // Filters for active users
      },
    });
  }

  //display all lawyers
  async getLawyers() {
    return this.prisma.user.findMany({
      where: {
        role: {
          name: 'Lawyer',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        is_active: true,
      },
    });
  }



  //find user by id
  async findUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          is_active: true,
          created_by: true,
          created_at: true,
          updated_at: true,
          last_login: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return user;
    } catch (error) {
      if (error.code === 'P2023') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw error;
    }
  }

  async updateUser(id: string, updateUserDto: Partial<CreateUserDto>) {

  try {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    // Check if email is being updated and if it exists for another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if phone is being updated and if it exists for another user
    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });
      if (phoneExists) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // If role_id is being updated, check if the role exists
    if (updateUserDto.role_id) {
      const roleExists = await this.prisma.role.findUnique({
        where: { id: updateUserDto.role_id },
      });
      if (!roleExists) {
        throw new BadRequestException('Role ID does not exist');
      }
    }

    // Perform the update
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return updatedUser;
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint failed
      throw new ConflictException('Unique field already exists');
    }
    throw new BadRequestException(
      error?.message || 'An error occurred while updating the user',
    );

  }
}


}


