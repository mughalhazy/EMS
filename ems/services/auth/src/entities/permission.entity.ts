import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RolePermissionEntity } from './role-permission.entity';

@Entity({ name: 'permissions' })
@Index('uq_permissions_resource_action', ['resource', 'action'], { unique: true })
@Index('uq_permissions_code', ['code'], { unique: true })
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  resource!: string;

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'varchar', length: 128 })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  roles!: RolePermissionEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
