const firstExpresion = /feedback:([\w\W]*)affinity:\s*([.,\d]+)\s*/gi;

const secondExpresion = /affinity:\s*([.,\d]+)\s*feedback:([\w\W]*)/gi;

const thirdExpresion = /\*\*feedback:\*\*([\w\W]*)\*\*affinity:\*\*\s*([.,\d]+)\s*/gi;
/**
 * Obtiene la respuesta del modelo
 * @param response
 * @throws Error si no se pudo obtener la respuesta del modelo
 * @returns
 */
export const getResponseFromModel = async (response: string) => {
  const firstMatch = firstExpresion.exec(response);
  const secondMatch = secondExpresion.exec(response);
  const thirdMatch = thirdExpresion.exec(response);

  if (firstMatch) {
    return {
      feedback: firstMatch[1].trim(),
      affinity: parseFloat(firstMatch[2]),
    };
  }

  if (secondMatch) {
    return {
      feedback: secondMatch[2].trim(),
      affinity: parseFloat(secondMatch[1]),
    };
  }

  if (thirdMatch) {
    return {
      feedback: thirdMatch[1].trim(),
      affinity: parseFloat(thirdMatch[2]),
    };
  }

  throw new Error('No se pudo obtener la respuesta del modelo');
};
