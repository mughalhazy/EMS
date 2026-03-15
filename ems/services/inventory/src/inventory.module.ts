import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryPoolEntity } from './entities/inventory-pool.entity';
import { InventoryReservationEntity } from './entities/inventory-reservation.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryPoolEntity, InventoryReservationEntity])],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
