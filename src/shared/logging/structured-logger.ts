import { Global, Injectable, Logger, Module } from '@nestjs/common';

/**
 * StructuredLogger:
 * - Eventos semánticos: `vacancy.created`, `application.apply.failed`.
 * - Payload JSON parseable (listo para ingesta por un ELK/Datadog futuro).
 * - `timed()` envuelve una promesa y loguea duración al finalizar.
 * - **Sin servicios externos** (solo `Logger` interno de Nest).
 */
type LogFields = Record<string, unknown>;
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable()
export class StructuredLogger {
  private readonly nest: Logger;

  constructor(scope: string = 'Application') {
    this.nest = new Logger(scope);
  }

  /** Devuelve un sub-logger con un `scope` (component) propio, comparte tiempo. */
  child(scope: string): StructuredLogger {
    return new StructuredLogger(scope);
  }

  debug(event: string, fields: LogFields = {}): void {
    this.emit('debug', event, fields);
  }
  info(event: string, fields: LogFields = {}): void {
    this.emit('info', event, fields);
  }
  warn(event: string, fields: LogFields = {}): void {
    this.emit('warn', event, fields);
  }
  error(event: string, fields: LogFields = {}): void {
    this.emit('error', event, fields);
  }

  /**
   * Mide `fn()` y emite `event.start` antes y `event.end` (con `durationMs`)
   * al finalizar. Si lanza, emite `event.error` con `cause`.
   */
  async timed<T>(
    event: string,
    fn: () => Promise<T>,
    fields: LogFields = {},
  ): Promise<T> {
    const startedAt = Date.now();
    const eventName = this.normalizeEvent(event);
    const startEvent = `${eventName}.start`;
    this.emit('info', startEvent, fields);
    try {
      const result = await fn();
      this.emit('info', `${eventName}.end`, {
        ...fields,
        durationMs: Date.now() - startedAt,
        outcome: 'success',
      });
      return result;
    } catch (error) {
      this.emit('error', `${eventName}.error`, {
        ...fields,
        durationMs: Date.now() - startedAt,
        outcome: 'failure',
        error: this.serializeError(error),
      });
      throw error;
    }
  }

  private emit(level: LogLevel, event: string, fields: LogFields): void {
    const payload = JSON.stringify({
      event,
      level,
      timestamp: new Date().toISOString(),
      ...fields,
    });
    const message = `${event} ${this.stringifyFields(fields)}`;
    switch (level) {
      case 'debug':
        this.nest.debug(message);
        break;
      case 'info':
        this.nest.log(message);
        break;
      case 'warn':
        this.nest.warn(message);
        break;
      case 'error':
        this.nest.error(message);
        break;
    }
    // Mantenemos un side-channel estructurado para futura ingesta (Datadog/etc).
    // Sin servicios externos: stdout parseable.
    this.stdout(payload);
  }

  private stringifyFields(fields: LogFields): string {
    const entries = Object.entries(fields);
    if (!entries.length) return '';
    return entries.map(([k, v]) => `${k}=${this.shortValue(v)}`).join(' ');
  }

  private shortValue(v: unknown): string {
    if (v === null || v === undefined) return String(v);
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return '[unserializable]';
    }
  }

  private serializeError(error: unknown): unknown {
    if (error instanceof Error) {
      const typed = error as Error & {
        code?: unknown;
        context?: unknown;
      };
      return {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        ...(typeof typed.code === 'string' ? { code: typed.code } : {}),
        ...(typeof typed.context === 'object' && typed.context !== null
          ? { context: typed.context }
          : {}),
      };
    }
    return error;
  }

  private normalizeEvent(event: string): string {
    return event.replace(/\./g, '_');
  }

  private stdout(payload: string): void {
    // `Logger` ya escribe a stdout con su propio formato.
    // Aquí emitimos el payload estructurado para mantener compat con scripts de log.
    process.stdout.write(`${payload}\n`);
  }
}

/**
 * `LoggingModule` exporta `StructuredLogger` de manera GLOBAL para que
 * cualquier use-case/handler/repositorio pueda inyectarlo sin declararlo
 * en su módulo.
 */
@Global()
@Module({
  providers: [
    {
      provide: StructuredLogger,
      useFactory: () => new StructuredLogger('Application'),
    },
  ],
  exports: [StructuredLogger],
})
export class LoggingModule {}
