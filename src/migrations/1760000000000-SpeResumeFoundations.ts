import { MigrationInterface, QueryRunner } from 'typeorm';

export class SpeResumeFoundations1760000000000 implements MigrationInterface {
  name = 'SpeResumeFoundations1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "country_of_birth" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "department_of_birth" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "city_of_birth" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "country_of_residence" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "department_of_residence" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "city_of_residence" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "sex" varchar(30)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "genre" varchar(30)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "sexual_orientation" varchar(40)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "ethnic_group" varchar(40)`);
    await queryRunner.query(`ALTER TABLE "applicant" ADD COLUMN IF NOT EXISTS "salary_aspiration" int`);

    await queryRunner.query(`ALTER TABLE "resume" ADD COLUMN IF NOT EXISTS "work_modality" varchar(20)`);

    await queryRunner.query(`ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "education_level" varchar(30)`);
    await queryRunner.query(`ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "program_name" varchar(120)`);
    await queryRunner.query(`ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "country" varchar(60)`);

    await queryRunner.query(`ALTER TABLE "experience" ADD COLUMN IF NOT EXISTS "country" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "experience" ADD COLUMN IF NOT EXISTS "department" varchar(60)`);
    await queryRunner.query(`ALTER TABLE "experience" ADD COLUMN IF NOT EXISTS "city" varchar(60)`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "knowledge" ("id" SERIAL NOT NULL, "name" character varying(60) NOT NULL, CONSTRAINT "PK_knowledge" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_knowledge_name" ON "knowledge" ("name")`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "resume_knowledge" ("resume_id" integer NOT NULL, "knowledge_id" integer NOT NULL, CONSTRAINT "PK_resume_knowledge" PRIMARY KEY ("resume_id", "knowledge_id"))`);
    const fkResume = await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_resume_knowledge_resume'`);
    if (!fkResume.length) {
      await queryRunner.query(`ALTER TABLE "resume_knowledge" ADD CONSTRAINT "FK_resume_knowledge_resume" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    const fkKnowledge = await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_resume_knowledge_knowledge'`);
    if (!fkKnowledge.length) {
      await queryRunner.query(`ALTER TABLE "resume_knowledge" ADD CONSTRAINT "FK_resume_knowledge_knowledge" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume_knowledge" DROP CONSTRAINT IF EXISTS "FK_resume_knowledge_knowledge"`);
    await queryRunner.query(`ALTER TABLE "resume_knowledge" DROP CONSTRAINT IF EXISTS "FK_resume_knowledge_resume"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resume_knowledge"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_knowledge_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "knowledge"`);
    await queryRunner.query(`ALTER TABLE "experience" DROP COLUMN IF EXISTS "city"`);
    await queryRunner.query(`ALTER TABLE "experience" DROP COLUMN IF EXISTS "department"`);
    await queryRunner.query(`ALTER TABLE "experience" DROP COLUMN IF EXISTS "country"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN IF EXISTS "country"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN IF EXISTS "program_name"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN IF EXISTS "education_level"`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN IF EXISTS "work_modality"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "salary_aspiration"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "ethnic_group"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "sexual_orientation"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "genre"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "sex"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "city_of_residence"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "department_of_residence"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "country_of_residence"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "city_of_birth"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "department_of_birth"`);
    await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN IF EXISTS "country_of_birth"`);
  }
}
