/**
 * Chain of Responsibility base.
 *
 * Uso típico:
 *   const chain = ownership.setNext(eligibility).setNext(statusCheck);
 *   await chain.handle(ctx);
 *
 * Cada handler:
 * - Es una clase (DI-friendly).
 * - Implementa `process(ctx)` con UNA validación/transformación.
 * - Puede abortar la cadena lanzando un `DomainError`.
 * - Puede mutar `ctx` para pasar contexto (ej. la `vacancy` ya cargada).
 */
export interface ChainHandler<T> {
  setNext(handler: ChainHandler<T>): ChainHandler<T>;
  handle(context: T): Promise<T>;
}

export abstract class BaseChainHandler<T> implements ChainHandler<T> {
  private next: ChainHandler<T> | null = null;

  setNext(handler: ChainHandler<T>): ChainHandler<T> {
    this.next = handler;
    return handler;
  }

  async handle(context: T): Promise<T> {
    await this.process(context);
    if (this.next) {
      return this.next.handle(context);
    }
    return context;
  }

  protected abstract process(context: T): Promise<void>;
}
