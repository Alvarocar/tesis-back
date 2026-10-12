import { AppDataSource } from '../src/typeorm-datasource';
(async () => {
  await AppDataSource.initialize();
  const r = await AppDataSource.query('SELECT COUNT(*)::int AS c FROM skill');
  console.log('Total skills:', r[0].c);
  await AppDataSource.destroy();
})();
