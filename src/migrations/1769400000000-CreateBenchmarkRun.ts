import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBenchmarkRun1769400000000 implements MigrationInterface {
  name = 'CreateBenchmarkRun1769400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "benchmark_run" (
        "id"            SERIAL NOT NULL,
        "application_id" integer,
        "model_name"    character varying(120) NOT NULL,
        "run_index"     integer NOT NULL,
        "affinity"      double precision,
        "feed_back"     text,
        "input_tokens"  integer,
        "output_tokens" integer,
        "duration_secs" double precision,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_benchmark_run" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "benchmark_run"
        ADD CONSTRAINT "FK_benchmark_run_application"
        FOREIGN KEY ("application_id")
        REFERENCES "application"("id")
        ON DELETE CASCADE
        ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "benchmark_run" DROP CONSTRAINT "FK_benchmark_run_application"`,
    );
    await queryRunner.query(`DROP TABLE "benchmark_run"`);
  }
}
