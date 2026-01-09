# Guía de Testing - Neuro Screen

## 📦 Estructura de Tests

```
src/
├── test/
│   ├── setup.ts              # Configuración global (bcrypt, crypto)
│   ├── test-db.config.ts     # Configuración SQLite en memoria
│   ├── test-helpers.ts       # Helpers y factories
│   ├── mocks/
│   │   └── index.ts          # Mocks de servicios comunes
│   └── README.md             # Documentación detallada
```

## 🚀 Comandos

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar en modo watch
pnpm test:watch

# Ejecutar con coverage
pnpm test:cov

# Ejecutar un archivo específico
pnpm test employee.service.spec.ts
```

## ✅ Configuración Completada

### ✨ Features

- ✅ **SQLite en memoria** - Base de datos real para tests
- ✅ **Bcrypt mockeado globalmente** - Siempre retorna 'hashed-password'
- ✅ **Crypto mockeado** - Tokens predecibles ('mocked-token-123456')
- ✅ **TestDatabaseHelper** - Clase helper para setup fácil
- ✅ **TestDataFactory** - Generadores de datos de prueba
- ✅ **Mocks comunes** - MailService, SecurityService, LLM Client

## 📝 Ejemplo Rápido

```typescript
import { TestDatabaseHelper, TestDataFactory } from '../test/test-helpers';
import { mockMailService } from '../test/mocks';

describe('MiService', () => {
  let dbHelper: TestDatabaseHelper;
  let service: MiService;

  beforeAll(async () => {
    dbHelper = new TestDatabaseHelper();
    await dbHelper.createTestingModule({
      imports: [TypeOrmModule.forFeature([MiEntity])],
      providers: [
        MiService,
        { provide: MailService, useValue: mockMailService },
      ],
    });
    service = dbHelper.getService(MiService);
  });

  afterAll(async () => {
    await dbHelper.closeModule();
  });

  it('debe funcionar', async () => {
    // Tu test aquí
  });
});
```

## 🎯 Próximos Pasos

1. Ejecutar: `pnpm test` para verificar que todo funcione
2. Los tests de EmployeeService y CompanyService ya están listos
3. Puedes usar el mismo patrón para otros servicios

## 📚 Ver Documentación Completa

Lee [src/test/README.md](src/test/README.md) para ejemplos detallados y documentación completa.
