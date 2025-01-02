export const ENV = {
  POSTGRESS: {
    type: process.env.RELATIONAL_DB_TYPE as 'postgres',
    host: process.env.RELATIONAL_DB_HOST,
    port: process.env.RELATIONAL_DB_PORT,
    username: process.env.RELATIONAL_DB_USERNAME,
    password: process.env.RELATIONAL_DB_PASSWORD,
    database: process.env.RELATIONAL_DB_DATABASE,
    synchronize: true,
    logging: process.env.RELATIONAL_DB_LOGGING === 'true',
  },
  COMPANY: {
    NAME: process.env.COMPANY_NAME ?? 'UMB',
  },
  AMQP: {
    URL: process.env.AMQP_URL,
  },
};
