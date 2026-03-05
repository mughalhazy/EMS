import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('api/v1/tenants/:tenantId/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateUserDto,
  ): Promise<UserEntity> {
    const existingUser = await this.userService.findByTenantAndEmail(
      tenantId,
      payload.email,
    );

    if (existingUser) {
      throw new ConflictException(
        `User with email '${payload.email}' already exists in tenant.`,
      );
    }

    return this.userService.create({
      tenantId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      status: payload.status,
    });
  }

  @Get()
  async listUsers(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<UserEntity[]> {
    return this.userService.findByTenant(tenantId);
  }

  @Get(':userId')
  async getUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserEntity> {
    const user = await this.userService.findByTenantAndId(tenantId, userId);
    if (!user) {
      throw new NotFoundException('User not found in tenant.');
    }

    return user;
  }

  @Patch(':userId/status')
  async updateUserStatus(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() payload: UpdateUserStatusDto,
  ): Promise<UserEntity> {
    const user = await this.userService.updateStatus(tenantId, userId, payload.status);
    if (!user) {
      throw new NotFoundException('User not found in tenant.');
    }

    return user;
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    const deleted = await this.userService.remove(tenantId, userId);
    if (!deleted) {
      throw new NotFoundException('User not found in tenant.');
    }
  }
}
