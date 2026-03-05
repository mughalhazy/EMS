import { EventVisibility } from '../entities/event-setting.entity';

export class UpdateEventSettingDto {
  timezone?: string;
  capacity?: number | null;
  visibility?: EventVisibility;
}
