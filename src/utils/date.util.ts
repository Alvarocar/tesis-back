import moment from 'moment';

export const stringToDate = (data: string, format = 'DD-MM-YYYY') => moment(data, format).toDate();
