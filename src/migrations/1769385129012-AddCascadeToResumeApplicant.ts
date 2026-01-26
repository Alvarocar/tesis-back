import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeToResumeApplicant1769385129012 implements MigrationInterface {
    name = 'AddCascadeToResumeApplicant1769385129012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "FK_5b19ae7262b795819b4d8dd1d30"`);
        await queryRunner.query(`ALTER TABLE "vacancy" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resume" ADD CONSTRAINT "FK_5b19ae7262b795819b4d8dd1d30" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "FK_5b19ae7262b795819b4d8dd1d30"`);
        await queryRunner.query(`ALTER TABLE "vacancy" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resume" ADD CONSTRAINT "FK_5b19ae7262b795819b4d8dd1d30" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
