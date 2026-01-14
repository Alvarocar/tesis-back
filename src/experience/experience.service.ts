import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Experience } from 'src/resume/entities/experience.entity';
import { ExperienceDto } from 'src/resume/dto/resume-detail.dto';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Resume } from 'src/resume/entities/resume.entity';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async createOrUpdate(
    resumeId: number,
    experienceDto: ExperienceDto,
    user: TokenDto,
  ) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new NotFoundException('Hoja de vida no encontrada');
    }
    const experience = this.experienceRepository.create({
      id: experienceDto.id,
      company: experienceDto.company,
      startDate: DateUtil.toDate(experienceDto.startDate),
      endDate: experienceDto.endDate
        ? DateUtil.toDate(experienceDto.endDate)
        : undefined,
      description: experienceDto.description,
      keepWorking: experienceDto.keepWorking ?? false,
      rol: experienceDto.rol,
      resume,
    });

    await this.experienceRepository.save(experience);

    return {
      id: experience.id,
      company: experience.company,
      startDate: DateUtil.toString(experience.startDate),
      endDate: experience.endDate && DateUtil.toString(experience.endDate),
      description: experience.description,
      keepWorking: experience.keepWorking ?? false,
      rol: experience.rol,
    } satisfies ExperienceDto;
  }

  async delete(resumeId: number, experienceId: number, user: TokenDto) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new NotFoundException('Hoja de vida no encontrada');
    }

    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId, resume: { id: resumeId } },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    await this.experienceRepository.remove(experience);
  }
}
