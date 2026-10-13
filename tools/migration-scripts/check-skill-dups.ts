import { AppDataSource } from '../../src/typeorm-datasource';

(async () => {
  await AppDataSource.initialize();
  const r = await AppDataSource.query(
    "SELECT name, COUNT(*)::int AS c FROM skill GROUP BY name HAVING COUNT(*) > 1",
  );
  console.log('Duplicate skill names:', JSON.stringify(r));
  await AppDataSource.destroy();
})();
