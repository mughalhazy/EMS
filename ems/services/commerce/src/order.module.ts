import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './order.service';
import { RedisLockService } from './redis-lock.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, InventoryEntity])],
  providers: [OrderService, RedisLockService],
  exports: [OrderService, RedisLockService],
})
export class OrderModule {}
