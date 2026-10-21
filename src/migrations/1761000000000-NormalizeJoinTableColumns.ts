import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normaliza el naming de las columnas de las tablas de join a `snake_case`.
 *
 * El esquema arranco con dos convenciones mezcladas: `resume_skill`,
 * `resume_language` y `vacancy_skill` quedaron en camelCase (por el default
 * de TypeORM cuando `@JoinTable` no declara `joinColumn`), mientras
 * `resume_knowledge` y `vacancy_language` quedaron en snake_case.
 *
 * Unificar deja el esquema consistente y, sobre todo, permite que las
 * entidades declaren `@JoinTable` con `joinColumn` explicito en vez de
 * depender del nombre inferido.
 *
 * Nota: `vacant_to_language` no se toca. Ninguna entidad la referencia
 * (parece residuo de `vacancy_language`); queda fuera de alcance a
 * proposito.
 */
export class NormalizeJoinTableColumns1761000000000
  implements MigrationInterface
{
  name = 'NormalizeJoinTableColumns1761000000000';

  /** [tabla, nombre actual, nombre destino] */
  private static readonly RENAMES: ReadonlyArray<
    readonly [string, string, string]
  > = [
    ['resume_skill', 'resumeId', 'resume_id'],
    ['resume_skill', 'skillId', 'skill_id'],
    ['resume_language', 'resumeId', 'resume_id'],
    ['resume_language', 'languageId', 'language_id'],
    ['vacancy_skill', 'vacancyId', 'vacancy_id'],
    ['vacancy_skill', 'skillId', 'skill_id'],
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameColumns(
      queryRunner,
      NormalizeJoinTableColumns1761000000000.RENAMES,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameColumns(
      queryRunner,
      NormalizeJoinTableColumns1761000000000.RENAMES.map(
        ([table, from, to]) => [table, to, from] as const,
      ),
    );
  }

  /**
   * Renombra columnas de forma condicional: si la tabla no existe, o la
   * columna origen no esta, o la destino ya existe, no hace nada. Asi la
   * migracion es idempotente y se puede correr mas de una vez sin romper.
   */
  private async renameColumns(
    queryRunner: QueryRunner,
    renames: ReadonlyArray<readonly [string, string, string]>,
  ): Promise<void> {
    for (const [table, from, to] of renames) {
      if (!(await this.hasTable(queryRunner, table))) continue;

      const columns = await this.columnsOf(queryRunner, table);
      if (!columns.includes(from) || columns.includes(to)) continue;

      await queryRunner.query(
        `ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`,
      );
    }
  }

  private async hasTable(queryRunner: QueryRunner, table: string) {
    const rows = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1 LIMIT 1`,
      [table],
    );
    return rows.length > 0;
  }

  private async columnsOf(queryRunner: QueryRunner, table: string) {
    const rows = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1`,
      [table],
    );
    return rows.map((r) => r.column_name as string);
  }
}
