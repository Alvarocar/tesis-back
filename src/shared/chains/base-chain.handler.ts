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
 *
 * ORDEN DE EJECUCIÓN
 * ------------------
 * `setNext` devuelve el handler SIGUIENTE (no `this`). Por eso la composición
 * se hace hacia adelante:
 *
 *   a.setNext(b)  ->  a.next = b, b.prev = a, devuelve `b`
 *   .setNext(c)   ->  b.next = c, c.prev = b, devuelve `c`
 *
 * El puntero doble (`prev` + `next`) permite que `handle()` arranque siempre
 * por la RAÍZ de la cadena y recorra hacia adelante. Consecuencia práctica:
 * `handle()` produce el mismo orden sin importar desde qué nodo se invoque
 * (head, intermedio o tail).
 *
 * RESTRICCIÓN
 * -----------
 * Los handlers son singletons de Nest y `link` muta su estado interno, por lo
 * que un handler NO debe pertenecer a dos cadenas distintas a la vez: la
 * segunda composición pisaría el `next` del primero. Cada handler pertenece a
 * una única cadena.
 */
export interface ChainHandler<T> {
  setNext(handler: ChainHandler<T>): ChainHandler<T>;
  handle(context: T): Promise<T>;
}

export abstract class BaseChainHandler<T> implements ChainHandler<T> {
  /** Handler ANTERIOR en la cadena. `null` en la raíz. */
  private prev: BaseChainHandler<T> | null = null;

  /** Handler SIGUIENTE en la cadena. `null` en el tail. */
  private next: BaseChainHandler<T> | null = null;

  /**
   * Enlace interno entre dos handlers. Es la implementación de `setNext` y
   * puede variar sin afectar la API pública; ninguna otra clase debe
   * alcanzar esta lógica.
   */
  private link(handler: ChainHandler<T>): ChainHandler<T> {
    const target = handler as unknown as BaseChainHandler<T>;
    target.prev = this;
    this.next = target;
    return handler;
  }

  /**
   * API pública de composición. Devuelve el handler siguiente para poder
   * encadenar: `a.setNext(b).setNext(c)`.
   */
  setNext(handler: ChainHandler<T>): ChainHandler<T> {
    return this.link(handler);
  }

  /**
   * Ejecuta la cadena completa en orden, desde la raíz hasta el tail.
   *
   * Se localiza primero la raíz (siguiendo `prev`) para garantizar el orden
   * natural de composición, y luego se recorre hacia adelante (siguiendo
   * `next`) ejecutando `process` en cada handler.
   */
  async handle(context: T): Promise<T> {
    // Localizar la raíz de la cadena sin aliasar `this`.
    const root = this.findRoot();

    // Recorrer hacia adelante (siguiendo `next`) ejecutando cada etapa.
    let current: BaseChainHandler<T> | null = root;
    while (current) {
      await current.process(context);
      current = current.next;
    }

    return context;
  }

  /**
   * Devuelve el primer handler de la cadena (el que no tiene `prev`).
   */
  private findRoot(): BaseChainHandler<T> {
    let node = this.prev;
    while (node) {
      const previous = node.prev;
      if (!previous) {
        return node;
      }
      node = previous;
    }
    return this;
  }

  protected abstract process(context: T): Promise<void>;
}
