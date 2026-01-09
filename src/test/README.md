# Configuración de Tests

Este directorio contiene la configuración base para todos los tests del proyecto.

## Archivos

### `setup.ts`
Configuración global que se ejecuta antes de todos los tests:
- Mock de `bcrypt` global
- Mock de `crypto` para tokens predecibles
- Configuración de timezone UTC
- Timeout por defecto de 10 segundos

### `test-db.config.ts`
Configuración de SQLite en memoria para tests:
- Base de datos en memoria (`:memory:`)
- Sincronización automática de esquema
- Logging desactivado
- Lista de todas las entidades del proyecto

### `test-helpers.ts`
Utilidades para facilitar la escritura de tests:

#### `TestDatabaseHelper`
- `createTestingModule()`: Crea un módulo de testing con TypeORM
- `getService()`: Obtiene un servicio del módulo
- `getRepository()`: Obtiene un repositorio
- `clearRepository()`: Limpia un repositorio
- `closeModule()`: Cierra el módulo

#### `TestDataFactory`
- `createCompanyData()`: Crea datos de compañía
- `createEmployeeData()`: Crea datos de empleado
- `createApplicantData()`: Crea datos de aplicante
- `generateUniqueEmail()`: Genera email único
- `generateUniqueNit()`: Genera NIT único

#### `TestAssertions`
- `expectDateToBeNow()`: Verifica fecha reciente
- `expectToHaveProperties()`: Verifica propiedades
- `expectValidEmail()`: Valida formato de email

### `mocks/index.ts`
Mocks comunes para servicios externos:
- `mockMailService`: Mock del servicio de correos
- `mockSecurityService`: Mock del servicio de seguridad
- `mockLlmClient`: Mock del cliente LLM

## Uso

### Ejemplo básico con TestDatabaseHelper

```typescript
import { TestDatabaseHelper, TestDataFactory } from '../test/test-helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { Company } from '../company/entities/company.entity';
import { mockMailService } from '../test/mocks';
import { MailService } from '../mail/mail.service';

describe('EmployeeService', () => {
  let dbHelper: TestDatabaseHelper;
  let service: EmployeeService;
  let employeeRepo: Repository<Employee>;
  let companyRepo: Repository<Company>;
  let testCompany: Company;

  beforeAll(async () => {
    dbHelper = new TestDatabaseHelper();
    
    await dbHelper.createTestingModule({
      imports: [TypeOrmModule.forFeature([Employee, Company])],
      providers: [
        EmployeeService,
        { provide: MailService, useValue: mockMailService },
      ],
    });

    service = dbHelper.getService(EmployeeService);
    employeeRepo = dbHelper.getRepository(Employee);
    companyRepo = dbHelper.getRepository(Company);
  });

  beforeEach(async () => {
    await dbHelper.clearRepositories([employeeRepo, companyRepo]);
    
    // Crear compañía de prueba
    testCompany = await companyRepo.save(
      TestDataFactory.createCompanyData()
    );
  });

  afterAll(async () => {
    await dbHelper.closeModule();
  });

  it('debe crear un empleado', async () => {
    const employeeData = TestDataFactory.createEmployeeData(testCompany.id);
    const employee = await employeeRepo.save(employeeData);
    
    expect(employee).toBeDefined();
    expect(employee.companyId).toBe(testCompany.id);
  });
});
```

### Ejemplo sin helper (enfoque manual)

```typescript
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDbConfig } from '../test/test-db.config';

describe('MyService', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        TypeOrmModule.forFeature([MyEntity]),
      ],
      providers: [MyService],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  // tus tests...
});
```

## Configuración en package.json

Asegúrate de tener en tu `package.json`:

```json
{
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/src/test/setup.ts"]
  }
}
```

O en tu `jest.config.js`:

```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // ... resto de configuración
};
```
