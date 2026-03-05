import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(input: DeepPartial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  async findByTenant(tenantId: string): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { tenantId },
      relations: { tenant: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    userId: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id: userId, tenantId },
      relations: { tenant: true },
    });
  }

  async findByTenantAndEmail(
    tenantId: string,
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { tenantId, email },
      relations: { tenant: true },
    });
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    status: UserEntity['status'],
  ): Promise<UserEntity | null> {
    const user = await this.findByTenantAndId(tenantId, userId);
    if (!user) {
      return null;
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  async remove(tenantId: string, userId: string): Promise<boolean> {
    const result = await this.userRepository.delete({ id: userId, tenantId });
    return (result.affected ?? 0) > 0;
  }

}
