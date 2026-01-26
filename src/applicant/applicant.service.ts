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
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { DateUtil } from 'src/shared/utils/date.util';
import { DetailApplicantDto } from 'src/auth/dto/detail-applicant.dto';
import { MailService } from 'src/mail/mail.service';
import { MoreThan } from 'typeorm';
import { Role } from 'src/shared/enums/role.enum';
import { SecurityService } from 'src/shared/security/security.service';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';

@Injectable()
export class ApplicantService {
  // Delete an applicant and cascade related entities
  async deleteApplicant(id: number): Promise<void> {
    const applicant = await this.applicantRepository.findOne({ where: { id } });

    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${id} not found`);
    }

    try {
      await this.applicantRepository.remove(applicant);
    } catch (error) {
      this.logger.error('Error deleting applicant:', error);
      throw new InternalServerErrorException(
        'Failed to delete applicant due to database constraints',
      );
    }
  }
  private readonly resetLink = `${FRONTEND_URL}/aspirante/restablecer-contrasena`;

  async generatePasswordResetToken(email: string): Promise<void> {
    try {
      const applicant = await this.findByEmail(email);
      if (!applicant) {
        throw new NotFoundException(
          'No se encontró un solicitante con este correo electrónico.',
        );
      }

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);
      const token = await this.securityService.generateToken({
        id: applicant.id,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        role: Role.Applicant,
        exp: Math.floor(expirationTime.getTime() / 1000),
      });
      const resetLink = `${this.resetLink}?token=${token}`;

      await this.applicantRepository.update(applicant.id, {
        invitationToken: token,
        invitationTokenExpires: expirationTime,
      });

      await this.mailService.sendEmail({
        to: applicant.email,
        subject: 'Instrucciones para restablecer tu contraseña',
        key: 'reset-password.applicant',
        context: {
          name: `${applicant.firstName} ${applicant.lastName}`,
          url: resetLink,
        },
      });
    } catch (error) {
      this.logger.error('Failed to generate password reset token', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el enlace para restablecer la contraseña.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const applicant = await this.applicantRepository.findOne({
        where: {
          invitationToken: token,
          invitationTokenExpires: MoreThan(new Date()),
        },
      });

      if (!applicant) {
        throw new BadRequestException('El token es inválido o ha expirado.');
      }

      const hashedPassword =
        await this.securityService.generateHash(newPassword);
      applicant.password = hashedPassword;
      applicant.invitationToken = null;
      applicant.invitationTokenExpires = null;

      await this.applicantRepository.save(applicant);
    } catch (error) {
      this.logger.error('Failed to reset password', error);
      throw new InternalServerErrorException(
        'No se pudo restablecer la contraseña.',
      );
    }
  }
  private readonly logger = new Logger(ApplicantService.name);

  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
    private readonly mailService: MailService,
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

      await this.applicantRepository.save(applicantEntity);

      await this.mailService.sendEmail({
        to: applicantEntity.email,
        subject: '¡Bienvenido a NextStep!',
        key: 'welcome.applicant',
        context: {
          name: `${applicantEntity.firstName} ${applicantEntity.lastName}`,
          url: FRONTEND_URL ?? '',
        },
      });

      return applicantEntity;
    } catch (e: unknown) {
      this.logger.error((e as Error).message, (e as Error).stack);
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
