import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normaliza los datos demográficos del applicant sin eliminar registros.
 *
 * Las columnas se crearon como varchar en SpeResumeFoundations. Esta
 * migración actualiza únicamente sus valores y conserva usuarios, postulaciones
 * y hojas de vida intactas.
 */
export class NormalizeApplicantDemographics1785000000000
  implements MigrationInterface
{
  name = 'NormalizeApplicantDemographics1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'applicant'))) return;

    await queryRunner.query(
      `ALTER TABLE "applicant" ALTER COLUMN "sex" TYPE varchar(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "applicant" ALTER COLUMN "genre" TYPE varchar(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "applicant" ALTER COLUMN "sexual_orientation" TYPE varchar(40)`,
    );
    await queryRunner.query(
      `ALTER TABLE "applicant" ALTER COLUMN "ethnic_group" TYPE varchar(100)`,
    );

    await queryRunner.query(`
      UPDATE "applicant"
      SET "sex" = CASE
        WHEN "sex" IN ('MASCULINO', 'Masculino') THEN 'Masculino'
        WHEN "sex" IN ('FEMENINO', 'Femenino') THEN 'Femenino'
        WHEN "sex" IN ('OTRO', 'OTROS', 'Otros') THEN 'Otros'
        WHEN "sex" IN ('PREFIERO_NO_DECIRLO', 'Prefiero no decirlo') THEN 'Prefiero no decirlo'
        WHEN "sex" IS NOT NULL THEN 'Otros'
        ELSE NULL
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "genre" = CASE
        WHEN "genre" IN ('HOMBRE', 'Hombre') THEN 'Hombre'
        WHEN "genre" IN ('MUJER', 'Mujer') THEN 'Mujer'
        WHEN "genre" IN ('MUJER_TRANS', 'HOMBRE_TRANS', 'TRANSGENERO', 'Transgénero') THEN 'Transgénero'
        WHEN "genre" IN ('OTRO', 'Otro') THEN 'Otro'
        WHEN "genre" IN ('PREFIERO_NO_DECIRLO', 'Prefiero no decirlo') THEN 'Prefiero no decirlo'
        WHEN "genre" IS NOT NULL THEN 'Otro'
        ELSE NULL
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "sexual_orientation" = CASE
        WHEN "sexual_orientation" IN ('HETEROSEXUAL', 'Heterosexual') THEN 'Heterosexual'
        WHEN "sexual_orientation" IN ('HOMOSEXUAL', 'Homosexual') THEN 'Homosexual'
        WHEN "sexual_orientation" IN ('BISEXUAL', 'Bisexual') THEN 'Bisexual'
        WHEN "sexual_orientation" IN ('PANSEXUAL', 'Pansexual') THEN 'Pansexual'
        WHEN "sexual_orientation" IN ('ASEXUAL', 'Asexual') THEN 'Asexual'
        WHEN "sexual_orientation" IN ('OTRO', 'Otro') THEN 'Otro'
        WHEN "sexual_orientation" IN ('PREFIERO_NO_DECIRLO', 'Prefiero no decirlo') THEN 'Prefiero no decirlo'
        WHEN "sexual_orientation" IS NOT NULL THEN 'Otro'
        ELSE NULL
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "ethnic_group" = CASE
        WHEN "ethnic_group" IN ('INDIGENA', 'Indígena') THEN 'Indígena'
        WHEN "ethnic_group" IN ('AFRODESCENDIENTE', 'Afrodescendiente') THEN 'Afrodescendiente (Negro(a), afrocolombiano(a), afrodescendiente o mulato(a))'
        WHEN "ethnic_group" = 'Afrodescendiente (Negro(a), afrocolombiano(a), afrodescendiente o mulato(a))' THEN 'Afrodescendiente (Negro(a), afrocolombiano(a), afrodescendiente o mulato(a))'
        WHEN "ethnic_group" IN ('RAIZAL', 'Raizal') THEN 'Raizal'
        WHEN "ethnic_group" IN ('PALENQUERO', 'Palenquero') THEN 'Palenquero'
        WHEN "ethnic_group" IN ('ROM_O_GITANO', 'ROM O GITANO', 'Rom o Gitano') THEN 'Rom o Gitano'
        WHEN "ethnic_group" IN ('NINGUNO', 'Ninguno') THEN 'Ninguno'
        WHEN "ethnic_group" IN ('PREFIERO_NO_DECIRLO', 'Prefiero no decirlo') THEN 'Prefiero no decirlo'
        WHEN "ethnic_group" IS NOT NULL THEN 'Prefiero no decirlo'
        ELSE NULL
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'applicant'))) return;

    await queryRunner.query(`
      UPDATE "applicant"
      SET "sex" = CASE
        WHEN "sex" = 'Masculino' THEN 'MASCULINO'
        WHEN "sex" = 'Femenino' THEN 'FEMENINO'
        WHEN "sex" = 'Otros' THEN 'OTRO'
        WHEN "sex" = 'Prefiero no decirlo' THEN 'PREFIERO_NO_DECIRLO'
        ELSE "sex"
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "genre" = CASE
        WHEN "genre" = 'Hombre' THEN 'HOMBRE'
        WHEN "genre" = 'Mujer' THEN 'MUJER'
        WHEN "genre" = 'Transgénero' THEN 'MUJER_TRANS'
        WHEN "genre" = 'Otro' THEN 'OTRO'
        WHEN "genre" = 'Prefiero no decirlo' THEN 'PREFIERO_NO_DECIRLO'
        ELSE "genre"
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "sexual_orientation" = CASE
        WHEN "sexual_orientation" = 'Heterosexual' THEN 'HETEROSEXUAL'
        WHEN "sexual_orientation" = 'Homosexual' THEN 'HOMOSEXUAL'
        WHEN "sexual_orientation" = 'Bisexual' THEN 'BISEXUAL'
        WHEN "sexual_orientation" = 'Pansexual' THEN 'PANSEXUAL'
        WHEN "sexual_orientation" = 'Asexual' THEN 'ASEXUAL'
        WHEN "sexual_orientation" = 'Otro' THEN 'OTRO'
        WHEN "sexual_orientation" = 'Prefiero no decirlo' THEN 'PREFIERO_NO_DECIRLO'
        ELSE "sexual_orientation"
      END
    `);

    await queryRunner.query(`
      UPDATE "applicant"
      SET "ethnic_group" = CASE
        WHEN "ethnic_group" = 'Indígena' THEN 'INDIGENA'
        WHEN "ethnic_group" = 'Afrodescendiente (Negro(a), afrocolombiano(a), afrodescendiente o mulato(a))' THEN 'AFRODESCENDIENTE'
        WHEN "ethnic_group" = 'Raizal' THEN 'RAIZAL'
        WHEN "ethnic_group" = 'Palenquero' THEN 'PALENQUERO'
        WHEN "ethnic_group" = 'Rom o Gitano' THEN 'ROM_O_GITANO'
        WHEN "ethnic_group" = 'Ninguno' THEN 'NINGUNO'
        WHEN "ethnic_group" = 'Prefiero no decirlo' THEN 'PREFIERO_NO_DECIRLO'
        ELSE "ethnic_group"
      END
    `);
  }

  private async hasTable(
    queryRunner: QueryRunner,
    table: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1 LIMIT 1`,
      [table],
    )) as unknown[];

    return rows.length > 0;
  }
}
