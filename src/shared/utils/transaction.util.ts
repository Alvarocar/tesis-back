import type { DataSource, EntityManager } from 'typeorm';

/**
 * Wrapper tipado para ejecutar una unidad de trabajo dentro de una transacción.
 *
 *   return withTransaction(dataSource, async (manager) => {
 *     await manager.insert(...);
 *     await manager.update(...);
 *   });
 */
export async function withTransaction<T>(
  dataSource: DataSource,
  work: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  return dataSource.transaction(work);
}
