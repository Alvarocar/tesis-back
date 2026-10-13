/**
 * DomainError: error tipado del dominio.
 * Cada error del negocio se representa como una clase que extiende `DomainError`
 * y aporta `code` (estable, snake-upper) + `httpStatus` (código HTTP sugerido)
 * + `context` (campos clave para logs y respuesta al cliente).
 *
 * Esto evita errores ad-hoc, permite trazabilidad uniforme y abre la puerta
 * a reportar errores con causa preservada cuando vienen de la infra.
 */
export type ErrorContext = Record<string, unknown>;

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly context: ErrorContext;
  readonly cause?: unknown;

  constructor(
    message: string,
    options?: { cause?: unknown; context?: ErrorContext },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.context = options?.context ?? {};
    this.cause = options?.cause;
    if ('captureStackTrace' in Error) {
      (
        Error as unknown as {
          captureStackTrace: (
            target: object,
            ctor: new (...args: unknown[]) => unknown,
          ) => void;
        }
      ).captureStackTrace(this, this.constructor as new (...args: unknown[]) => unknown);
    }
  }

  /**
   * Serialización JSON-safe para logs/responses.
   * Recorta `cause` recursivamente y serializa structs simples.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      httpStatus: this.httpStatus,
      message: this.message,
      context: this.context,
      cause:
        this.cause instanceof Error
          ? { name: this.cause.name, message: this.cause.message }
          : this.cause,
    };
  }
}

/* ---------- Errors genéricos ---------- */

export class NotFoundError extends DomainError {
  readonly code = 'GENERAL.NOT_FOUND';
  readonly httpStatus = 404;
  constructor(resource: string, id?: unknown) {
    super(`${resource} no encontrado`, { context: { resource, id } });
  }
}

export class ValidationError extends DomainError {
  readonly code = 'GENERAL.VALIDATION';
  readonly httpStatus = 400;
  constructor(message: string, context?: ErrorContext) {
    super(message, { context });
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'GENERAL.FORBIDDEN';
  readonly httpStatus = 403;
  constructor(message: string, context?: ErrorContext) {
    super(message, { context });
  }
}

export class ConflictError extends DomainError {
  readonly code = 'GENERAL.CONFLICT';
  readonly httpStatus = 409;
  constructor(message: string, context?: ErrorContext) {
    super(message, { context });
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'GENERAL.UNAUTHORIZED';
  readonly httpStatus = 401;
  constructor(message = 'No autorizado', context?: ErrorContext) {
    super(message, { context });
  }
}

/* ---------- Errors de dominio específicos ---------- */

export class VacancyNotFoundError extends DomainError {
  readonly code = 'VACANCY.NOT_FOUND';
  readonly httpStatus = 404;
  constructor(vacancyId: number) {
    super(`Vacante ${vacancyId} no encontrada`, {
      context: { vacancyId },
    });
  }
}

export class VacancyOwnershipError extends DomainError {
  readonly code = 'VACANCY.OWNERSHIP_DENIED';
  readonly httpStatus = 403;
  constructor(userId: number, vacancyId: number) {
    super('No tiene permisos sobre esta vacante', {
      context: { userId, vacancyId },
    });
  }
}

export class ResumeOwnershipError extends DomainError {
  readonly code = 'RESUME.OWNERSHIP_DENIED';
  readonly httpStatus = 403;
  constructor(userId: number, resumeId: number) {
    super('La hoja de vida no pertenece al usuario', {
      context: { userId, resumeId },
    });
  }
}

export class ApplicantNotFoundError extends DomainError {
  readonly code = 'APPLICANT.NOT_FOUND';
  readonly httpStatus = 404;
  constructor(applicantId: number) {
    super(`Applicant ${applicantId} no encontrado`, {
      context: { applicantId },
    });
  }
}

export class DuplicateEmailError extends DomainError {
  readonly code = 'USER.DUPLICATE_EMAIL';
  readonly httpStatus = 409;
  constructor(email: string) {
    super(`Ya existe un usuario con el email ${email}`, {
      context: { email },
    });
  }
}
