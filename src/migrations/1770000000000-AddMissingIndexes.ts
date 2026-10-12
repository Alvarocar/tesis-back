import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddMissingIndexes.
 *
 * Añade índices a las columnas por las que filtramos en queries criticas:
 *  - applicant.email (login)
 *  - applicant.invitation_token (reset password)
 *  - employee.email (login)
 *  - employee.company_id (filtros por tenant)
 *  - employee.invitation_token (employee set-password)
 *  - vacancy.employee_id (queries recurrentes de "mis vacantes")
 *  - vacancy.status (filtro principal en listados)
 *  - application.vacancy_id (filtro por vacante)
 *  - application.resume_id (filtro por resume)
 *  - resume.applicant_id (filtro por applicant)
 *  - skill.name (UNIQUE): previene skills duplicadas en inserts concurrentes.
 *
 * Notas:
 *  - Se usa CREATE INDEX (no CONCURRENTLY) porque la migración corre dentro
 *    de una transacción. Koyeb/RDS no son ámbas amigas de IF NOT EXISTS +
 *    CONCURRENTLY en tx. Si hubiera escrituras concurrentes pesadas,
 *    sería preferible correrlo en horario de mantenimiento.
 *  - Skill.name UNIQUE: si ya hay duplicados en la tabla, la migración
 *    fallará. Antes de correrla, asegúrate de que no haya duplicados.
 */
export class AddMissingIndexes1770000000000 implements MigrationInterface {
  name = 'AddMissingIndexes1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Applicant
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_applicant_email" ON "applicant" ("email")',
    );
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_applicant_invitation_token" ON "applicant" ("invitation_token")',
    );

    // Employee
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_employee_email" ON "employee" ("email")',
    );
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_employee_company_id" ON "employee" ("company_id")',
    );
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_employee_invitation_token" ON "employee" ("invitation_token")',
    );

    // Vacancy
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_vacancy_employee_id" ON "vacancy" ("employee_id")',
    );
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_vacancy_status" ON "vacancy" ("status")',
    );

    // Application
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_application_vacancy_id" ON "application" ("vacancy_id")',
    );
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_application_resume_id" ON "application" ("resume_id")',
    );

    // Resume
    await this.tryIndex(
      queryRunner,
      'CREATE INDEX "idx_resume_applicant_id" ON "resume" ("applicant_id")',
    );

    // Skill.name: UNIQUE (prevenir duplicados a nivel DB).
    // Si ya hay duplicados en la tabla, fallará y la migración se abortará.
    await this.tryIndex(
      queryRunner,
      'CREATE UNIQUE INDEX "idx_skill_name_unique" ON "skill" ("name")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropIfExists(queryRunner, 'idx_skill_name_unique');
    await this.dropIfExists(queryRunner, 'idx_resume_applicant_id');
    await this.dropIfExists(queryRunner, 'idx_application_resume_id');
    await this.dropIfExists(queryRunner, 'idx_application_vacancy_id');
    await this.dropIfExists(queryRunner, 'idx_vacancy_status');
    await this.dropIfExists(queryRunner, 'idx_vacancy_employee_id');
    await this.dropIfExists(queryRunner, 'idx_employee_invitation_token');
    await this.dropIfExists(queryRunner, 'idx_employee_company_id');
    await this.dropIfExists(queryRunner, 'idx_employee_email');
    await this.dropIfExists(queryRunner, 'idx_applicant_invitation_token');
    await this.dropIfExists(queryRunner, 'idx_applicant_email');
  }

  /**
   * Algunos hosts Postgres crean índices idempotentes con IF NOT EXISTS;
   * otros no. Para que la migración sea idempotente y reproducibible,
   * lo intentamos: si ya existe, lo registramos pero no rompemos.
   */
  private async tryIndex(qr: QueryRunner, sql: string): Promise<void> {
    try {
      await qr.query(sql);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('already exists') || msg.includes('already_existing')) {
        // Ya estaba creado en una corrida previa: idempotente, proseguir.
        return;
      }
      throw err;
    }
  }

  private async dropIfExists(qr: QueryRunner, name: string): Promise<void> {
    await qr.query(`DROP INDEX IF EXISTS "${name}"`);
  }
}
