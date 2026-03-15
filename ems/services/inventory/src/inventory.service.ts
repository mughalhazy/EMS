import { Injectable } from '@nestjs/common';

import { InventoryPoolEntity } from './entities/inventory-pool.entity';
import { InventoryReservationEntity, InventoryReservationStatus } from './entities/inventory-reservation.entity';

export interface InventoryAvailabilitySnapshot {
  capacity: number;
  reserved: number;
  held: number;
  available: number;
}

@Injectable()
export class InventoryService {
  getAvailabilitySnapshot(
    pool: Pick<InventoryPoolEntity, 'capacity' | 'reservedQuantity'>,
    reservations: ReadonlyArray<Pick<InventoryReservationEntity, 'quantity' | 'status' | 'expiresAt'>>,
    now = new Date(),
  ): InventoryAvailabilitySnapshot {
    const capacity = Math.max(0, pool.capacity);
    const reserved = Math.max(0, pool.reservedQuantity);
    const held = this.getActiveReservedQuantity(reservations, now);
    const available = Math.max(0, capacity - reserved - held);

    return { capacity, reserved, held, available };
  }

  getActiveReservedQuantity(
    reservations: ReadonlyArray<Pick<InventoryReservationEntity, 'quantity' | 'status' | 'expiresAt'>>,
    now = new Date(),
  ): number {
    return reservations
      .filter(
        (reservation) =>
          reservation.status === InventoryReservationStatus.Active &&
          reservation.expiresAt.getTime() > now.getTime(),
      )
      .reduce((sum, reservation) => sum + reservation.quantity, 0);
  }
}
