import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Skill } from 'src/shared/entities/skill.entity';
import { SkillDto } from 'src/resume/dto/resume-detail.dto';
import { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async createOrUpdateSkillsForApplicant(
    resumeId: number,
    skills: SkillDto[],
    user: TokenDto,
  ) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
      relations: ['skills'],
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const skillNames = skills.map((s) => s.name);

    // Buscar todas las skills existentes en una sola consulta
    const existingSkills = await this.skillRepository.find({
      where: {
        name: In(skillNames),
      },
    });

    // Identificar skills nuevas
    const existingSkillNames = new Set(existingSkills.map((s) => s.name));
    const newSkillNames = skillNames.filter(
      (name) => !existingSkillNames.has(name),
    );

    // Crear skills nuevas en una sola operación
    let newSkills: Skill[] = [];
    if (newSkillNames.length > 0) {
      newSkills = await this.skillRepository.save(
        newSkillNames.map((name) => this.skillRepository.create({ name })),
      );
    }

    // Combinar skills existentes y nuevas
    resume.skills = [...existingSkills, ...newSkills];

    // Guardar el resume (TypeORM actualiza automáticamente la tabla intermedia resume_skill)
    await this.resumeRepository.save(resume);

    return resume;
  }
}
