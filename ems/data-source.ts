import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM CLI data source, used for generating and running migrations.
 * The running application configures its own connection via
 * apps/api/src/app.module.ts (TypeOrmModule.forRootAsync).
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['services/**/src/entities/*.entity.ts', 'infra/**/src/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  synchronize: false,
});
