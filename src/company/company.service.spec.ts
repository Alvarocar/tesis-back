import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { Employee } from '../employee/entities/employee.entity';
import { TestDatabaseHelper, TestDataFactory } from '../test/test-helpers';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompanyService', () => {
  let dbHelper: TestDatabaseHelper;
  let service: CompanyService;
  let companyRepo: Repository<Company>;

  beforeAll(async () => {
    dbHelper = new TestDatabaseHelper();

    await dbHelper.createTestingModule({
      imports: [TypeOrmModule.forFeature([Company, Employee])],
      providers: [CompanyService],
    });

    service = dbHelper.getService(CompanyService);
    companyRepo = dbHelper.getRepository(Company);
  });

  beforeEach(async () => {
    await dbHelper.clearRepository(companyRepo);
  });

  afterAll(async () => {
    await dbHelper.closeModule();
  });

  describe('create', () => {
    it('debe crear una compañía exitosamente', async () => {
      const dto: CreateCompanyDto = {
        name: 'Test Company',
        address: '123 Test St',
        phone: '1234567890',
        nit: TestDataFactory.generateUniqueNit(),
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
      expect(result.nit).toBe(dto.nit);
      expect(result.isActive).toBe(true);
    });

    it('debe lanzar ConflictException si el NIT ya existe', async () => {
      const nit = TestDataFactory.generateUniqueNit();
      await companyRepo.save(TestDataFactory.createCompanyData({ nit }));

      const dto: CreateCompanyDto = {
        name: 'Another Company',
        nit,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe retornar solo compañías activas', async () => {
      await companyRepo.save([
        TestDataFactory.createCompanyData({ isActive: true }),
        TestDataFactory.createCompanyData({ isActive: true }),
        TestDataFactory.createCompanyData({ isActive: false }),
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.isActive)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('debe encontrar una compañía por ID', async () => {
      const company = await companyRepo.save(
        TestDataFactory.createCompanyData(),
      );

      const result = await service.findOne(company.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(company.id);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una compañía', async () => {
      const company = await companyRepo.save(
        TestDataFactory.createCompanyData(),
      );

      const dto: UpdateCompanyDto = { name: 'Updated Name' };
      const result = await service.update(company.id, dto);

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('debe realizar soft delete', async () => {
      const company = await companyRepo.save(
        TestDataFactory.createCompanyData(),
      );

      await service.remove(company.id);

      const deleted = await companyRepo.findOne({ where: { id: company.id } });
      expect(deleted?.isActive).toBe(false);
    });
  });
});
