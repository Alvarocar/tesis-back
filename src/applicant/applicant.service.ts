import { Repository } from 'typeorm';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { CreateApplicantDto } from 'src/auth/dto/create-applicant.dto';
import { Applicant } from './entities/applicant.entity';
import { SecurityService } from 'src/shared/security/security.service';

@Injectable()
export class ApplicantService {
  private readonly logger = new Logger(ApplicantService.name);

  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
    private readonly securityService: SecurityService,
  ) {}

  async create(createApplicantDto: CreateApplicantDto) {
    try {
      const doppleganger = await this.applicantRepository.findOne({ where: { email: createApplicantDto.email } });
      if (doppleganger != null) throw new BadRequestException('Esta dirección de correo ya está en uso.');
      const hashedPassword = await this.securityService.generateHash(createApplicantDto.password);
      const applicantEntity = this.applicantRepository.create({
        creationDate: new Date(),
        modificationDate: new Date(),
        email: createApplicantDto.email,
        password: hashedPassword,
        firstName: createApplicantDto.firstName,
        lastName: createApplicantDto.lastName,
      });

      return applicantEntity;
    } catch (e) {
      this.logger.error('Error inesperado al crear el solicitante.', e.stack);
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error inesperado al crear el solicitante.');
    }
  }

  findByEmail(email: string) {
    return this.applicantRepository.findOne({ where: { email } });
  }

  findAll() {
    return `This action returns all applicant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} applicant`;
  }

  update(id: number, updateApplicantDto: UpdateApplicantDto) {
    return `This action updates a #${id} applicant`;
  }

  remove(id: number) {
    return `This action removes a #${id} applicant`;
  }
}
