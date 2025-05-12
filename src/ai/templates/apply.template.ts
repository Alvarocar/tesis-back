export const APPLY_TEMPLATE_PROMPT = {
  format(vacant: string, cv: string) {
    return `
    Analiza la siguiente postulación:

    CV (comienzo):
      ${cv}
    Cv (fin):
    vacante (comienzo):
      ${vacant}
    vacante (fin):
    `;
  },
};
