import { HttpError } from 'routing-controllers';

export class HttpException extends HttpError {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(status, message);
    this.status = status;
    this.message = message;
  }
}

export class BadRequestException extends HttpError {
  public message: string;
  constructor(message: string) {
    super(400, message);
    this.message = message;
  }
}

export class InternalServerException extends HttpError {
  public message: string;
  constructor(message: string) {
    super(500, message);
    this.message = message;
  }
}
