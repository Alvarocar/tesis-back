import dayjs from 'dayjs';

export class DateUtil {
  /**
   *
   * @param date
   * @param format
   * @default format = 'DD-MM-YYYY'
   * @returns
   */
  static toDate(date: string, format = 'DD-MM-YYYY'): Date {
    return dayjs(date, format).toDate();
  }

  /**
   *
   * @param date
   * @param format
   * @default format = 'DD-MM-YYYY'
   * @returns
   */
  static toString(date: Date, format = 'DD-MM-YYYY'): string {
    return dayjs(date).format(format);
  }

  static differenceInSeconds(date1: Date, date2: Date): number {
    return dayjs(date1).diff(dayjs(date2), 'second');
  }
}
