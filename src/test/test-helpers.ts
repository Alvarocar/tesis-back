import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { testDbConfig } from './test-db.config';

/**
 * Clase base para configurar módulos de testing con TypeORM
 */
export class TestDatabaseHelper {
  private module: TestingModule;

  /**
   * Crea un módulo de testing con TypeORM configurado
   */
  async createTestingModule(options: {
    imports?: any[];
    providers?: any[];
    controllers?: any[];
  }): Promise<TestingModule> {
    this.module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        ...(options.imports || []),
      ],
      providers: options.providers || [],
      controllers: options.controllers || [],
    }).compile();

    return this.module;
  }

  /**
   * Obtiene el módulo de testing
   */
  getModule(): TestingModule {
    return this.module;
  }

  /**
   * Obtiene un servicio del módulo
   */
  getService<T>(serviceClass: new (...args: any[]) => T): T {
    return this.module.get<T>(serviceClass);
  }

  /**
   * Obtiene un repositorio del módulo
   */
  getRepository<T extends Record<string, any>>(
    entity: new (...args: any[]) => T,
  ): Repository<T> {
    return this.module.get(`${entity.name}Repository`);
  }

  /**
   * Limpia un repositorio específico
   */
  async clearRepository<T extends Record<string, any>>(
    repository: Repository<T>,
  ): Promise<void> {
    await repository.clear();
  }

  /**
   * Limpia múltiples repositorios
   */
  async clearRepositories(repositories: Repository<any>[]): Promise<void> {
    for (const repo of repositories) {
      await repo.clear();
    }
  }

  /**
   * Cierra el módulo de testing
   */
  async closeModule(): Promise<void> {
    if (this.module) {
      await this.module.close();
    }
  }
}

/**
 * Factory para crear datos de prueba comunes
 */
export class TestDataFactory {
  /**
   * Crea una compañía de prueba
   */
  static createCompanyData(overrides?: Partial<any>) {
    return {
      name: 'Test Company',
      address: '123 Test Street',
      phone: '1234567890',
      nit: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      isActive: true,
      creationDate: new Date(),
      modificationDate: new Date(),
      ...overrides,
    };
  }

  /**
   * Crea un empleado de prueba
   */
  static createEmployeeData(companyId: number, overrides?: Partial<any>) {
    const timestamp = Date.now();
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: `test${timestamp}@example.com`,
      companyId,
      invitationToken: 'token-' + timestamp,
      invitationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: false,
      creationDate: new Date(),
      modificationDate: new Date(),
      ...overrides,
    };
  }

  /**
   * Crea un aplicante de prueba
   */
  static createApplicantData(overrides?: Partial<any>) {
    const timestamp = Date.now();
    return {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `applicant${timestamp}@example.com`,
      password: 'hashed-password',
      isActive: true,
      creationDate: new Date(),
      modificationDate: new Date(),
      ...overrides,
    };
  }

  /**
   * Genera un email único para tests
   */
  static generateUniqueEmail(prefix = 'test'): string {
    return `${prefix}${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
  }

  /**
   * Genera un NIT único para tests
   */
  static generateUniqueNit(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Helpers para verificaciones comunes en tests
 */
export class TestAssertions {
  /**
   * Verifica que una fecha sea aproximadamente ahora
   */
  static expectDateToBeNow(date: Date, marginMs = 5000): void {
    const now = Date.now();
    const dateTime = new Date(date).getTime();
    expect(Math.abs(now - dateTime)).toBeLessThan(marginMs);
  }

  /**
   * Verifica que un objeto tenga las propiedades esperadas
   */
  static expectToHaveProperties<T>(obj: T, properties: (keyof T)[]): void {
    properties.forEach((prop) => {
      expect(obj).toHaveProperty(String(prop));
    });
  }

  /**
   * Verifica que un email sea válido
   */
  static expectValidEmail(email: string): void {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }
}
