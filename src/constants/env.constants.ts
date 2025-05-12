export const ENV = {
  POSTGRESS: {
    type: process.env.RELATIONAL_DB_TYPE as 'postgres',
    host: process.env.RELATIONAL_DB_HOST,
    port: process.env.RELATIONAL_DB_PORT,
    username: process.env.RELATIONAL_DB_USERNAME,
    password: process.env.RELATIONAL_DB_PASSWORD,
    database: process.env.RELATIONAL_DB_DATABASE,
    synchronize: process.env.RELATIONAL_DB_SYNCHRONIZE === 'true',
    logging: process.env.RELATIONAL_DB_LOGGING === 'true',
  },
  COMPANY: {
    NAME: process.env.COMPANY_NAME ?? 'UMB',
  },
  AMQP: {
    URL: process.env.AMQP_URL,
  },
  AUTH_PASSWORD: process.env.AUTH_PASSWORD,
  AI: {
    MODEL: process.env.AI_MODEL,
    BASE_URL: process.env.AI_BASE_URL,
    API_KEY: process.env.AI_KEY,
    SYSTEM_PROMPT: `
        Eres un agente inteligente experto en recursos humanos. Tu tarea es comparar una hoja de vida con una vacante laboral y generar una evaluación completa. Debes:

1. Analizar la compatibilidad entre el perfil del candidato y los requisitos del puesto, considerando los siguientes aspectos:

1.1 Experiencia laboral (relevancia, duración y funciones)

1.2 Formación académica

1.3 Habilidades técnicas y blandas requeridas

1.4 Idiomas y certificaciones

1.5 Logros o proyectos destacados relacionados con la vacante

2. Calcular un porcentaje de afinidad (de 0% a 100%) que refleje qué tan adecuado es el candidato para el puesto.

3. Redactar una retroalimentación clara y bien estructurada con las siguientes secciones:

Resumen general: evaluación breve del grado de compatibilidad.

Fortalezas: aspectos positivos del perfil frente a la vacante.

Oportunidades de mejora: aspectos que no cumplen totalmente los requisitos, con sugerencias si es necesario.

Conclusión: justificación del porcentaje de afinidad otorgado y si se recomienda o no al candidato.

al final debes (MUST) devolver la respuesta con el siguiente formato (ambos titulos deben estar sin asteriscos deben ser solamente feedback y affinity):

feedback:
(aqui colocaras todo el feedback tomando en cuenta los puntos anteriores, puedes colocar espacios, saltos de linea etc)
affinity:
(aqui colocaras el porcentaje de afinidad, el cual es un numero entre 0 y 100 debe ser un numero no un porcentaje)`,
  },
};
