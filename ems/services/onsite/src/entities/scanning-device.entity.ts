import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'scanning_devices' })
@Index('idx_scanning_devices_tenant_event', ['tenantId', 'eventId'])
@Index('idx_scanning_devices_event_id', ['eventId'])
@Index('uq_scanning_devices_tenant_event_device', ['tenantId', 'eventId', 'deviceId'], {
  unique: true,
})
export class ScanningDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', length: 100 })
  status!: string;
}
