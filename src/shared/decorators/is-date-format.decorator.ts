import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

type SupportedFormat =
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'YYYY/MM/DD'
  | 'DD/MM/YYYY';

const FORMAT_MAP: Record<
  SupportedFormat,
  { regex: RegExp; indices: { year: number; month: number; day: number } }
> = {
  'YYYY-MM-DD': {
    regex: /^(\d{4})-(\d{2})-(\d{2})$/,
    indices: { year: 1, month: 2, day: 3 },
  },
  'DD-MM-YYYY': {
    regex: /^(\d{2})-(\d{2})-(\d{4})$/,
    indices: { day: 1, month: 2, year: 3 },
  },
  'YYYY/MM/DD': {
    regex: /^(\d{4})\/(\d{2})\/(\d{2})$/,
    indices: { year: 1, month: 2, day: 3 },
  },
  'DD/MM/YYYY': {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    indices: { day: 1, month: 2, year: 3 },
  },
};

export function IsDateFormat(
  format: SupportedFormat = 'YYYY-MM-DD',
  validationOptions?: ValidationOptions,
) {
  const config = FORMAT_MAP[format];
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCustomDateFormat',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const match = value.match(config.regex);
          if (!match) return false;

          const year = Number(match[config.indices.year]);
          const month = Number(match[config.indices.month]);
          const day = Number(match[config.indices.day]);

          const date = new Date(year, month - 1, day);
          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should had the format ${format} and be a valid date`;
        },
      },
    });
  };
}
