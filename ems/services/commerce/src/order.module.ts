import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './order.service';
import { RedisLockService } from './redis-lock.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, InventoryEntity])],
  providers: [OrderService, RedisLockService],
  exports: [OrderService, RedisLockService],
})
export class OrderModule {}
