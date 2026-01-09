export const nanoSecondsToSeconds = (nanoSeconds: number): number => {
  return nanoSeconds / 1_000_000_000;
};

export const millisecondsToSeconds = (milliseconds: number): number => {
  return milliseconds / 1_000;
};

export const secondsToMilliseconds = (seconds: number): number => {
  return seconds * 1_000;
};
