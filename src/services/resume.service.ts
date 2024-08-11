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
    const resume = ResumeRepository.create({
      title: resumeDto.title,
      experience_years: 0,
      about_me: '',
      create_date: actually_date,
      modification_date: actually_date,
      applicant,
    });
    await ResumeRepository.insert(resume);

    return resume;
  }
  async PutAboutMe(resumeDto: CreateAboutMeDto, applicant: Applicant) {
    return await ResumeRepository.updateAboutme(resumeDto, applicant);
  }
  async getResumes(applicantId: number) {
    return await ResumeRepository.createQueryBuilder('rm')
      .select(['rm.id', 'rm.title', 'rm.about_me'])
      .where('rm.applicantId = :id', { id: applicantId })
      .orderBy({ 'rm.modification_date': 'DESC' })
      .getMany();
  }

  async getResumeById(id: number, applicant: Applicant) {
    try {
      const resume = await ResumeRepository.createQueryBuilder("rs")
      .select(["rs.id", "rs.title", "rs.about_me", "rs.modification_date"])
      .addSelect(["ex.id", "ex.rol", "ex.company", "ex.start_date", "ex.end_date", "ex.keep_working", "ex.descripcion"])
      .addSelect(["ed.id", "ed.institute", "ed.title", "ed.start_date", "ed.end_date", "ed.keep_study"])
      .addSelect(["pr.id", "pr.name", "pr.number", "pr.relationship"])
      .addSelect(["lr.id", "lr.name", "lr.number", "lr.rol"])
      .addSelect(["rlan.id", "rlan.language_level"])
      .addSelect("lang.name")
      .addSelect("sk.id", "sk.name")
      .leftJoin("rs.experiences", "ex")
      .leftJoin("rs.educations", "ed")
      .leftJoin("rs.personal_references", "pr")
      .leftJoin("rs.laboral_references", "lr")
      .leftJoin("rs.resumeToLanguage", "rlan")
      .leftJoin("rlan.language", "lang")
      .leftJoin("rs.skills", "sk")
      .where("rs.id = :id", { id })
      .andWhere("rs.applicantId = :applicantId", { applicantId: applicant.id })
      .getOneOrFail()
      
      resume.applicant = applicant

      return {
        ...resume,
        resumeToLanguage: undefined, 
        languages: resume.resumeToLanguage.map(lan => ({ name: lan.language.name, level: lan.language_level }))
      }
    } catch(e) {
      console.log(e)
      throw new NotFoundError("La hoja de vida no fue encontrada")
    }
    
  }
}
