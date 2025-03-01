export const fromStringToJson = (raw: string) => {
  try {
    const jsonMatch = raw.match(/```json\n([\s\S]+)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    return JSON.parse(raw);
  } catch (e) {
    console.error('FROM stringToJSON Error: ', e);
    return {};
  }
};
