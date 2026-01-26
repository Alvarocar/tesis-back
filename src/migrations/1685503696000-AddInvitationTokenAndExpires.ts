import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvitationTokenAndExpires1685503696000
  implements MigrationInterface
{
  name = 'AddInvitationTokenAndExpires1685503696000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applicant" 
      ADD "invitation_token" varchar(255),
      ADD "invitation_token_expires" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applicant" 
      DROP COLUMN "invitation_token",
      DROP COLUMN "invitation_token_expires"`,
    );
  }
}
