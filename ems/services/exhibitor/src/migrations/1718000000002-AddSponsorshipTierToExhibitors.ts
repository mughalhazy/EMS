import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSponsorshipTierToExhibitors1718000000002
  implements MigrationInterface
{
  name = 'AddSponsorshipTierToExhibitors1718000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sponsor_tier" AS ENUM('gold', 'silver', 'bronze')`,
    );
    await queryRunner.query(
      `ALTER TABLE "exhibitors" ADD "sponsorship_tier" "public"."sponsor_tier"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exhibitors" DROP COLUMN "sponsorship_tier"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sponsor_tier"`);
  }
}
