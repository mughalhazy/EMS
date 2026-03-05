import { Injectable } from '@nestjs/common';

import { SessionEntity } from './entities/session.entity';

export interface SessionCapacitySnapshot {
  capacity: number | null;
  remainingSeats: number | null;
  allocatedSeats: number;
  hasAvailability: boolean;
}

@Injectable()
export class SessionCapacityService {
  getSnapshot(session: Pick<SessionEntity, 'capacity' | 'remainingSeats'>): SessionCapacitySnapshot {
    if (session.capacity === null) {
      return {
        capacity: null,
        remainingSeats: null,
        allocatedSeats: 0,
        hasAvailability: true,
      };
    }

    const capacity = Math.max(0, session.capacity);
    const remainingSeats = session.remainingSeats === null ? capacity : Math.min(capacity, Math.max(0, session.remainingSeats));

    return {
      capacity,
      remainingSeats,
      allocatedSeats: capacity - remainingSeats,
      hasAvailability: remainingSeats > 0,
    };
  }

  initializeRemainingSeats(session: SessionEntity): SessionEntity {
    session.remainingSeats = session.capacity;
    return session;
  }

  reserveSeat(session: SessionEntity, quantity = 1): SessionEntity {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Seat quantity must be a positive integer.');
    }

    if (session.capacity === null) {
      return session;
    }

    if (session.remainingSeats === null) {
      session.remainingSeats = session.capacity;
    }

    if (session.remainingSeats < quantity) {
      throw new Error('Not enough remaining seats to fulfill the reservation.');
    }

    session.remainingSeats -= quantity;
    return session;
  }

  releaseSeat(session: SessionEntity, quantity = 1): SessionEntity {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Seat quantity must be a positive integer.');
    }

    if (session.capacity === null) {
      return session;
    }

    if (session.remainingSeats === null) {
      session.remainingSeats = session.capacity;
    }

    session.remainingSeats = Math.min(session.capacity, session.remainingSeats + quantity);
    return session;
  }

  syncRemainingSeatsWithCapacity(session: SessionEntity): SessionEntity {
    if (session.capacity === null) {
      session.remainingSeats = null;
      return session;
    }

    if (session.remainingSeats === null) {
      session.remainingSeats = session.capacity;
      return session;
    }

    session.remainingSeats = Math.min(session.capacity, Math.max(0, session.remainingSeats));
    return session;
  }
}
