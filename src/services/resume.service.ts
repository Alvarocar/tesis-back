import { CreateAboutMeDto, CreateResumeDto, ResumeDto } from '@/dtos/resume.dto';
import { GenericService } from './generic.service';
import { Resume } from '@/models/resume.model';
import { AppDataSource } from '@/data-source';
import { Applicant } from '@/models/applicant.model';
import { Education } from '@/models/education.model';
import { Experience } from '@/models/experience.model';
import { ResumeRepository } from '@/repositories/resume.repository';
import { NotFoundError } from 'routing-controllers';
import { ResumeToLanguage } from '@/models/resume_to_language.model';
import { ExperienceRepository } from '@/repositories/experience.repository';
import { EducationRepository } from '@/repositories/education.respository';
import { ResumeToLanguageRepository } from '@/repositories/resumeToLanguage.repository';

export class ResumeService extends GenericService {
  async createResume(resumeDto: ResumeDto) {
    await AppDataSource.transaction(async manager => {
      let currentApplicant: Applicant;
      try {
        currentApplicant = await manager
          .getRepository(Applicant)
          .createQueryBuilder('ap')
          .where('ap.id = :id', { id: resumeDto.applicant_id })
          .getOneOrFail();
      } catch (error) {
        console.error(error);
        throw new NotFoundError('no id was given');
      }

      const resume = ResumeRepository.createFromDto(resumeDto);

      resume.applicant = currentApplicant;

      await manager.createQueryBuilder().insert().into(Resume).values(resume).execute();

      const languages = resumeDto.language.map(ResumeToLanguageRepository.createFromDto).map(lang => ({ ...lang, resume: resume }));

      await Promise.all(languages.map(lang => manager.createQueryBuilder().insert().into(ResumeToLanguage).values(lang).execute()));

      const experiences = resumeDto.experiences.map(exp => {
        const currentExp = ExperienceRepository.createFromDto(exp);
        currentExp.resume = resume;
        return currentExp;
      });

      await Promise.all(experiences.map(exp => manager.createQueryBuilder().insert().into(Experience).values(exp).execute()));

      const educations = resumeDto.educations.map(edu => {
        const eduCurrent = EducationRepository.createFromDto(edu);
        eduCurrent.resume = resume;
        return eduCurrent;
      });

      await Promise.all(educations.map(edu => manager.createQueryBuilder().insert().into(Education).values(edu).execute()));
    });
  }

  async createResumeWithJustTitle(resumeDto: CreateResumeDto, applicant: Applicant) {
    const actually_date = new Date(Date.now());
    await ResumeRepository.insert({
      title: resumeDto.title,
      experience_years: 0,
      about_me: '',
      create_date: actually_date,
      modification_date: actually_date,
      applicant,
    });
  }
  async PutAboutMe(resumeDto: CreateAboutMeDto) {
    return await ResumeRepository.updateAboutme(resumeDto);
  }

  async GetResume(resumeDto: )
}
