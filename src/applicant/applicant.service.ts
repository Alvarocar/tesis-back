import { Repository } from 'typeorm';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { CreateApplicantDto } from 'src/auth/dto/create-applicant.dto';
import { Applicant } from './entities/applicant.entity';
import { SecurityService } from 'src/shared/security/security.service';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { DateUtil } from 'src/shared/utils/date.util';
import { DetailApplicantDto } from 'src/auth/dto/detail-applicant.dto';

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
      const doppleganger = await this.applicantRepository.findOne({
        where: { email: createApplicantDto.email },
      });
      if (doppleganger != null)
        throw new BadRequestException(
          'Esta dirección de correo ya está en uso.',
        );
      const hashedPassword = await this.securityService.generateHash(
        createApplicantDto.password,
      );
      const applicantEntity = this.applicantRepository.create({
        creationDate: new Date(),
        modificationDate: new Date(),
        email: createApplicantDto.email,
        password: hashedPassword,
        firstName: createApplicantDto.firstName,
        lastName: createApplicantDto.lastName,
      });

      return applicantEntity;
    } catch (e: unknown) {
      this.logger.error(
        'Error inesperado al crear el solicitante.',
        (e as Error).stack,
      );
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Error inesperado al crear el solicitante.',
      );
    }
  }

  findByEmail(email: string) {
    return this.applicantRepository.findOne({ where: { email } });
  }

  async update(user: TokenDto, updateApplicantDto: UpdateApplicantDto) {
    try {
      await this.applicantRepository.update(
        { id: user.id },
        {
          firstName: updateApplicantDto.firstName,
          lastName: updateApplicantDto.lastName,
          identification: updateApplicantDto.identification,
          phoneNumber: updateApplicantDto.phoneNumber,
          birthDate: DateUtil.toDate(updateApplicantDto.birthDate),
          direction: updateApplicantDto.direction,
          modificationDate: new Date(),
        },
      );

      const updatedApplicant = await this.applicantRepository.findOne({
        where: { id: user.id },
      });

      if (!updatedApplicant) {
        this.logger.error(
          `No se encontró el solicitante con ID ${user.id} después de la actualización.`,
        );
        throw new NotFoundException('Solicitante no encontrado');
      }

      return {
        birthDate: DateUtil.toString(updatedApplicant.birthDate),
        direction: updatedApplicant.direction,
        firstName: updatedApplicant.firstName,
        identification: updatedApplicant.identification,
        lastName: updatedApplicant.lastName,
        phoneNumber: updatedApplicant.phoneNumber,
      } satisfies UpdateApplicantDto;
    } catch (e: unknown) {
      this.logger.error(
        `Error inesperado al actualizar la información personal del solicitante con ID ${user.id}.`,
        (e as Error).stack,
      );
      if (e instanceof HttpException) throw e;
      throw new NotFoundException(
        'Error inesperado al actualizar la información personal del solicitante.',
      );
    }
  }

  async findOne(id: number) {
    const applicant = await this.applicantRepository.findOne({ where: { id } });
    if (!applicant) {
      this.logger.error(`Solicitante con ID ${id} no encontrado.`);
      throw new NotFoundException('Solicitante no encontrado');
    }

    return {
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      creationDate: DateUtil.toString(applicant.creationDate),
      modificationDate: DateUtil.toString(applicant.modificationDate),
      id: applicant.id,
      phoneNumber: applicant.phoneNumber,
      birthDate: DateUtil.toString(applicant.birthDate),
      direction: applicant.direction,
      identification: applicant.identification,
    } satisfies DetailApplicantDto;
  }
}
