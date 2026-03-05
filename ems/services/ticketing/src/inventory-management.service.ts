import { InventoryEntity } from './entities/inventory.entity';
import { InventoryHoldEntity, InventoryHoldStatus } from './entities/inventory-hold.entity';

export interface InventorySnapshot {
  capacity: number;
  reserved: number;
  held: number;
  available: number;
}

export class InventoryManagementService {
  getSnapshot(
    inventory: Pick<InventoryEntity, 'totalQuantity' | 'reservedQuantity'>,
    holds: ReadonlyArray<Pick<InventoryHoldEntity, 'quantity' | 'status' | 'expiresAt'>>,
    now = new Date(),
  ): InventorySnapshot {
    const capacity = Math.max(0, inventory.totalQuantity);
    const reserved = Math.max(0, inventory.reservedQuantity);
    const held = this.getActiveHeldQuantity(holds, now);
    const available = Math.max(0, capacity - reserved - held);

    return { capacity, reserved, held, available };
  }

  getActiveHeldQuantity(
    holds: ReadonlyArray<Pick<InventoryHoldEntity, 'quantity' | 'status' | 'expiresAt'>>,
    now = new Date(),
  ): number {
    return holds
      .filter((hold) => hold.status === InventoryHoldStatus.Active && hold.expiresAt.getTime() > now.getTime())
      .reduce((sum, hold) => sum + hold.quantity, 0);
  }

  hasAvailability(
    inventory: Pick<InventoryEntity, 'totalQuantity' | 'reservedQuantity'>,
    holds: ReadonlyArray<Pick<InventoryHoldEntity, 'quantity' | 'status' | 'expiresAt'>>,
    requestedQuantity: number,
    now = new Date(),
  ): boolean {
    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
      return false;
    }

    const snapshot = this.getSnapshot(inventory, holds, now);
    return requestedQuantity <= snapshot.available;
  }

  createHold(
    params: {
      inventoryId: string;
      tenantId: string;
      quantity: number;
      holdDurationMs: number;
      referenceId?: string;
    },
    now = new Date(),
  ): InventoryHoldEntity {
    const { inventoryId, tenantId, quantity, holdDurationMs, referenceId } = params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Hold quantity must be a positive integer.');
    }

    if (holdDurationMs <= 0) {
      throw new Error('Hold duration must be greater than zero.');
    }

    const hold = new InventoryHoldEntity();
    hold.inventoryId = inventoryId;
    hold.tenantId = tenantId;
    hold.quantity = quantity;
    hold.status = InventoryHoldStatus.Active;
    hold.expiresAt = new Date(now.getTime() + holdDurationMs);
    hold.releasedAt = null;
    hold.referenceId = referenceId ?? null;

    return hold;
  }

  markHoldReleased(hold: InventoryHoldEntity, releasedAt = new Date()): InventoryHoldEntity {
    hold.status = InventoryHoldStatus.Released;
    hold.releasedAt = releasedAt;
    return hold;
  }

  markHoldExpired(hold: InventoryHoldEntity, expiredAt = new Date()): InventoryHoldEntity {
    hold.status = InventoryHoldStatus.Expired;
    hold.releasedAt = expiredAt;
    return hold;
  }

  confirmHold(hold: InventoryHoldEntity): InventoryHoldEntity {
    hold.status = InventoryHoldStatus.Confirmed;
    hold.releasedAt = null;
    return hold;
  }

  reserveQuantity(inventory: InventoryEntity, quantity: number): InventoryEntity {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Reserve quantity must be a positive integer.');
    }

    inventory.reservedQuantity += quantity;

    if (inventory.reservedQuantity > inventory.totalQuantity) {
      throw new Error('Reserved quantity cannot exceed inventory capacity.');
    }

    return inventory;
  }
}
