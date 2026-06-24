import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ schema: 'auth', name: 'sso_identities' })
@Unique(['connectionId', 'externalId'])
export class SsoIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  connectionId: string;

  @Column()
  externalId: string;

  @CreateDateColumn()
  createdAt: Date;
}
