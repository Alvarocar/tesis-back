import moment from 'moment';

export const stringToDate = (data: string, format = 'DD-MM-YYYY') => moment(data, format).toDate();

export const dateToString = (date: Date, format = 'DD-MM-YYYY') => moment(date).format(format);

export const differenceInSeconds = (date1: Date, date2: Date) => {
  // @ts-ignore
  const diffInMs: number = Math.abs(date1 - date2); // diferencia en milisegundos
  return diffInMs / 1000; // convertir a segundos
};
