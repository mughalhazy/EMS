import { SessionStatus, SessionType } from '../entities/session.entity';

export class UpdateSessionDto {
  roomId?: string | null;
  title?: string;
  abstract?: string | null;
  sessionType?: SessionType;
  startAt?: string;
  endAt?: string;
  capacity?: number | null;
  status?: SessionStatus;
}
