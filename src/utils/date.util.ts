import moment from 'moment';

export const stringToDate = (data: string, format = 'DD-MM-YYYY') => moment(data, format).toDate();

export const dateToString = (date: Date, format = 'DD-MM-YYYY') => moment(date).format(format);
