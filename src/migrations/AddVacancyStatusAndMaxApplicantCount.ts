import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVacancyStatusAndMaxApplicantCount
  implements MigrationInterface
{
  name = 'AddVacancyStatusAndMaxApplicantCount';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the PostgreSQL Enum for Vacancy Status
    await queryRunner.query(`
      CREATE TYPE "vacancy_status_enum" AS ENUM ('ENABLE', 'COMPLETED', 'ARCHIVED');
    `);

    // Add the column using the enum type
    await queryRunner.query(`
      ALTER TABLE "vacancy"
      ADD COLUMN "status" "vacancy_status_enum" DEFAULT 'ENABLE';
    `);

    // Add the max_applicant_count column
    await queryRunner.query(`
      ALTER TABLE "vacancy"
      ADD COLUMN "max_applicant_count" INTEGER NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the max_applicant_count column
    await queryRunner.query(`
      ALTER TABLE "vacancy"
      DROP COLUMN "max_applicant_count";
    `);

    // Drop the status column
    await queryRunner.query(`
      ALTER TABLE "vacancy"
      DROP COLUMN "status";
    `);

    // Drop the PostgreSQL Enum for Vacancy Status
    await queryRunner.query(`
      DROP TYPE "vacancy_status_enum";
    `);
  }
}
