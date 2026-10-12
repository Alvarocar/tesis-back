# AGENTS.md - Neuro Screen Development Guide

This file contains essential information for agentic coding agents working in this NestJS TypeScript repository.

## 🏗️ Build & Development Commands

### Core Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm start:dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Format code
pnpm format

# Lint and fix code
pnpm lint
```

### Testing Commands

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e

# Run single test file
pnpm test vacancy.service.spec.ts

# Debug tests
pnpm test:debug
```

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts             # Root module
├── shared/                   # Shared utilities and types
│   ├── utils/               # Date, DOM, Time utilities
│   ├── types/               # TypeScript type definitions
│   ├── enums/               # Application enums
│   └── constants/           # Application constants
├── test/                     # Test configuration and helpers
│   ├── setup.ts             # Global test setup (bcrypt, crypto mocks)
│   ├── test-helpers.ts      # Test database helper and factories
│   └── mocks/               # Service mocks
├── [feature]/               # Feature modules (vacancy, employee, etc.)
│   ├── [feature].module.ts
│   ├── [feature].service.ts
│   ├── [feature].controller.ts
│   ├── entities/            # TypeORM entities
│   ├── dto/                 # Data transfer objects
│   └── [feature].spec.ts    # Unit tests
```

## 🎨 Code Style Guidelines

### TypeScript Configuration

- Target: ES2023
- Module: nodenext with ES2023 module resolution
- Strict null checks enabled
- Decorators enabled for NestJS
- Path alias: `app` → `src`

### Import Organization

```typescript
// 1. Node.js built-ins
import 'dotenv/config';

// 2. External packages (NestJS first)
import { NestFactory } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

// 3. Internal modules (use path alias)
import { AppModule } from 'app/app.module';
import { DateUtil } from 'app/shared/utils/date.util';
import { CreateVacancyDto } from 'app/vacancy/dto/create-vacancy.dto';
```

### Naming Conventions

- **Files**: kebab-case (`vacancy.service.ts`, `create-vacancy.dto.ts`)
- **Classes**: PascalCase (`VacancyService`, `CreateVacancyDto`)
- **Methods**: camelCase (`createVacancy`, `findAllVacancies`)
- **Variables**: camelCase (`vacancyRepository`, `createVacancyDto`)
- **Constants**: UPPER_SNAKE_CASE (`FRONTEND_URL`, `DEFAULT_PAGE_SIZE`)
- **Enums**: PascalCase (`Role`, `VacancyJobType`)

### Service Pattern

```typescript
@Injectable()
export class VacancyService {
  private readonly logger = new Logger(VacancyService.name);

  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async create(createVacancyDto: CreateVacancyDto, user: TokenDto) {
    try {
      // Business logic here
      const vacancy = this.vacancyRepository.create({...});
      await this.vacancyRepository.insert(vacancy);

      return result satisfies CreatedVacancyDto;
    } catch (error) {
      this.logger.error('Error creating vacancy', error);
      throw new InternalServerErrorException('No se pudo crear la vacante');
    }
  }
}
```

### Controller Pattern

```typescript
@Controller('v1/vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(201)
  create(@Body() vacant: CreateVacancyDto, @Req() req: RequestWithUser) {
    return this.vacancyService.create(vacant, req.user);
  }
}
```

### DTO Pattern with Validation

```typescript
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => DomUtil.sanitizeHtml(value))
  description: string;

  @IsNumber()
  @IsPositive()
  salary: number;

  @IsNumber()
  @IsOptional()
  experienceYears: number;
}
```

## ⛔ Testing Guidelines

### Important Update

- Tests or mocking layers of any kind (unit tests, integration, or e2e tests) **MUST NOT** be added to this repository. This codebase is intended to remain without any test-related implementations.
- Implement features with clean and maintainable code without adding testing-specific code.
- Instead of tests, ensure the implementation is clean, structured, and follows the specified code style guidelines.

## 🔧 Error Handling

### Service Error Pattern

```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof HttpException) throw error;
  this.logger.error('Error description', error);
  throw new InternalServerErrorException('Mensaje en español');
}
```

### HTTP Status Codes

- 200: Successful GET
- 201: Successful POST
- 204: Successful PUT/DELETE (no content)
- 400: Validation errors
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Internal server error

## 📦 Database & ORM

### TypeORM Entity Pattern

```typescript
@Entity()
export class Vacancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modificationDate: Date;
}
```

### Repository Pattern

- Use `@InjectRepository(Entity)` for dependency injection
- Prefer `repository.create()` over `new Entity()`
- Use `repository.insert()` for single inserts
- Use `repository.save()` for updates with relations

## 🌐 API Design

### RESTful Conventions

- Use plural nouns for resources (`/vacancies`, `/employees`)
- Version APIs with prefix (`/v1/`)
- Use query parameters for filtering (`?page=1&pageSize=10`)
- Return consistent response structure

### Response Format

```typescript
// List response
{
  result: T[],
  currentPage: number,
  totalPages: number
}

// Single item response
{
  id: number,
  title: string,
  // ... other fields
}
```

## 🔒 Security

### Authentication

- Use JWT tokens via `jose` library
- Implement `@Roles()` decorator for authorization
- Validate user permissions in service layer

### Input Validation

- Sanitize HTML input with `DomUtil.sanitizeHtml()`
- Use `class-validator` for DTO validation
- Transform input data with `@Transform()`

## 📝 Utilities

### Date Operations

```typescript
import { DateUtil } from 'app/shared/utils/date.util';

// Format date
DateUtil.toString(new Date(), 'DD-MM-YYYY');

// Parse date
DateUtil.toDate('01-01-2024', 'DD-MM-YYYY');
```

### HTML Sanitization

```typescript
import { DomUtil } from 'app/shared/utils/dom.util';

const cleanHtml = DomUtil.sanitizeHtml(userInput);
```

## 🚀 Environment Setup

### Required Environment Variables

- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: CORS allowed origin
- Database connection variables

### Development Workflow

1. Run `pnpm install` to install dependencies
2. Use `pnpm start:dev` for development
3. Run `pnpm test` before committing
4. Use `pnpm lint` to fix code style issues
5. Run `pnpm format` to format code

## 📋 Important Notes

- All error messages should be in Spanish
- Use TypeScript strict mode features
- Follow NestJS conventions for modules and dependency injection
- Test coverage should be maintained for critical business logic
- Database operations should use transactions for complex operations
- Always handle errors gracefully with proper logging
