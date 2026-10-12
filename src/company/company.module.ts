import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { COMPANY_REPOSITORY } from './repositories/company.repository';
import { CompanyTypeOrmRepository } from './repositories/company.typeorm.repository';
import { FindCompanyWithCountUseCase } from './use-cases/find-company-with-count.use-case';
import { UpdateCompanyUseCase } from './use-cases/update-company.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: CompanyTypeOrmRepository,
    },
    FindCompanyWithCountUseCase,
    UpdateCompanyUseCase,
    CreateCompanyUseCase,
    CompanyService,
  ],
  exports: [CompanyService, COMPANY_REPOSITORY],
})
export class CompanyModule {}
