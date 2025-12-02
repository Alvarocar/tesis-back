import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNumberOrString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNumberOrString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'string' ||
            (typeof value === 'number' && !isNaN(value))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string or a number`;
        },
      },
    });
  };
}
