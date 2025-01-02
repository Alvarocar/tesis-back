import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const schema = z.object({
  affinity: z.number().min(1).max(10),
  feedback: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(schema);

export const APPLY_TEMPLATE_PROMPT = new PromptTemplate({
  template: `
  Analiza la siguiente hoja de vida y la descripción de la vacante. Evalúa y devuelve los siguientes resultados:
  1. "affinity": una puntuación de 1 a 10 sobre la correspondencia entre las habilidades del candidato y los requisitos de la vacante.
  2. "feedback": un resumen constructivo sobre cómo el perfil del candidato se ajusta o podría mejorar para esta vacante específica.

  CV (comienzo):
    {cv}
  Cv (fin):
  vacante (comienzo):
    {vacant}
  vacante (fin):

  Devuelve la afinidad y retroalimentación en el formato JSON indicado:
  {format_instructions}
  `,
  inputVariables: ['cv', 'vacant'],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});
