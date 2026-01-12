import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import { Resume } from 'src/resume/entities/resume.entity';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { EducationDto } from 'src/resume/dto/resume-detail.dto';
import { Education } from 'src/resume/entities/education.entity';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(Education)
    private educationRepository: Repository<Education>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async createOrUpdate(
    resumeId: number,
    education: EducationDto,
    user: TokenDto,
  ) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new NotFoundException('Hoja de vida no encontrada');
    }

    const educationEntity = this.educationRepository.create({
      id: education.id,
      institute: education.institute,
      title: education.title,
      startDate: DateUtil.toDate(education.startDate),
      endDate: education.endDate
        ? DateUtil.toDate(education.endDate)
        : undefined,
      keepStudy: education.keepStudy,
      resume,
    });

    await this.educationRepository.save(educationEntity);

    return {
      id: educationEntity.id,
      institute: educationEntity.institute,
      title: educationEntity.title,
      startDate: DateUtil.toString(educationEntity.startDate),
      endDate: educationEntity.endDate
        ? DateUtil.toString(educationEntity.endDate)
        : undefined,
      keepStudy: educationEntity.keepStudy ?? false,
    } satisfies EducationDto;
  }

  async delete(resumeId: number, educationId: number, user: TokenDto) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new NotFoundException('Hoja de vida no encontrada');
    }

    const education = await this.educationRepository.findOne({
      where: { id: educationId, resume: { id: resumeId } },
    });

    if (!education) {
      throw new NotFoundException('Educación no encontrada');
    }

    await this.educationRepository.remove(education);
  }
}
