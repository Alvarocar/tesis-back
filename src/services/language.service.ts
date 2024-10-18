import { LanguageDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { LanguageRepository } from '@/repositories/language.repository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { ResumeToLanguageRepository } from '@/repositories/resumeToLanguage.repository';

export class LanguageService {
  getLanguageByTerm(term: string) {
    try {
      return LanguageRepository.createQueryBuilder('lan')
        .select(['lan.name', 'lan.id'])
        .where(`lan.name ILIKE :query`, { query: `%${term}%` })
        .getMany();
    } catch {
      return [];
    }
  }

  async updateLanguages(languages: LanguageDto[], resumeId: number, applicant: Applicant) {
    const commingIds = languages.filter(lng => lng.id !== undefined).map(lng => lng.id);
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      const currentLanguages = await LanguageRepository.getByResume(resume);
      const preparedLanguages = currentLanguages.reduce(
        (acc, current) => {
          if (commingIds.includes(current.id)) {
            return {
              ...acc,
              toUpdate: [...acc.toUpdate, current],
            };
          }

          return {
            ...acc,
            toRemove: [...acc.toRemove, current],
          };
        },
        { toRemove: [], toUpdate: [], toCreate: languages.filter(lng => lng.id === undefined) },
      );
      const deletePromise = ResumeToLanguageRepository.deleteFromList(preparedLanguages.toRemove);
      const updatedPromise = ResumeToLanguageRepository.updateFromList(preparedLanguages.toUpdate);
      const insertedPromise = ResumeToLanguageRepository.insertFromList(preparedLanguages.toCreate, resume);
      await Promise.all([deletePromise, updatedPromise, insertedPromise]);
      return LanguageRepository.getByResume(resume);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
