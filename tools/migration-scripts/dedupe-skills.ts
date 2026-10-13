import { AppDataSource } from '../../src/typeorm-datasource';

/**
 * Scripts/clean-duplicate-skills.ts
 *
 * Ejecutar antes de la migración AddMissingIndexes.
 *
 *  1. Detecta skill.name duplicados.
 *  2. Conserva 1 fila (la de menor id) por nombre.
 *  3. Traslada las relaciones de `resume_skill` y `vacancy_skill`
 *     que apunten a duplicados a la fila canónica.
 *  4. Borra los duplicados.
 *
 * Idempotente: si lo corrés dos veces, no hace nada la segunda.
 */
(async () => {
  await AppDataSource.initialize();

  // Encontrar nombres duplicados con sus cuentas.
  const dupes: Array<{ name: string; c: number }> = await AppDataSource.query(
    "SELECT name, COUNT(*)::int AS c FROM skill GROUP BY name HAVING COUNT(*) > 1 ORDER BY name",
  );

  if (dupes.length === 0) {
    console.log('No duplicate skill names. Nothing to do.');
    await AppDataSource.destroy();
    return;
  }

  console.log(`Found ${dupes.length} duplicate names. Cleaning up.`);

  await AppDataSource.transaction(async (manager) => {
    for (const { name } of dupes) {
      // 1. Sacar todas las skills con ese nombre, ordenadas por id.
      const rows: Array<{ id: number }> = await manager.query(
        'SELECT id FROM skill WHERE name = $1 ORDER BY id ASC',
        [name],
      );
      const canonical = rows[0].id;
      const dups = rows.slice(1).map((r) => r.id);
      if (dups.length === 0) continue;

      // 2. Mover relaciones de resume_skill.
      await manager.query(
        `UPDATE resume_skill SET "skillId" = $1 WHERE "skillId" = ANY($2::int[])`,
        [canonical, dups],
      );
      // 3. Mover relaciones de vacancy_skill.
      await manager.query(
        `UPDATE vacancy_skill SET "skillId" = $1 WHERE "skillId" = ANY($2::int[])`,
        [canonical, dups],
      );

      // 4. Eliminar las filas duplicadas (con FK now apunta solo a canonical).
      await manager.query(
        'DELETE FROM skill WHERE id = ANY($1::int[])',
        [dups],
      );

      console.log(`  - "${name}": kept id ${canonical}, removed ${dups.length} dup(s)`);
    }
  });

  // Verificación final.
  const remaining: Array<{ name: string; c: number }> = await AppDataSource.query(
    "SELECT name, COUNT(*)::int AS c FROM skill GROUP BY name HAVING COUNT(*) > 1",
  );
  console.log(
    remaining.length === 0
      ? 'Cleanup complete. No duplicates remain.'
      : `WARNING: still ${remaining.length} duplicates: ${JSON.stringify(remaining)}`,
  );

  await AppDataSource.destroy();
})();
