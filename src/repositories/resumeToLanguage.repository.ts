import { AppDataSource } from '@/data-source';
import { LanguageDto } from '@/dtos/resume.dto';
import { ResumeLanguage } from '@/models/resume_to_language.model';
import { LanguageRepository } from './language.repository';
import { Resume } from '@/models/resume.model';

export const ResumeToLanguageRepository = AppDataSource.getRepository(ResumeLanguage).extend({
  createFromDto: (languageDto: LanguageDto) => {
    return ResumeToLanguageRepository.create({
      language: { id: languageDto.id },
      languageLevel: languageDto.level,
    });
  },
  deleteFromList: (languages: LanguageDto[]) => {
    return Promise.all(languages.map(lng => ResumeToLanguageRepository.createQueryBuilder().delete().where('id = :id', { id: lng.id }).execute()));
  },
  updateFromList: (languages: Required<LanguageDto>[]) => {
    return Promise.all(
      languages.map(lng =>
        ResumeToLanguageRepository.createQueryBuilder()
          .update()
          .set({ languageLevel: lng.level, id: lng.id })
          .where('id = :id', { id: lng.id })
          .execute(),
      ),
    );
  },
  insertFromList: (languages: LanguageDto[], resume: Resume) => {
    return Promise.all(
      languages.map(async lng => {
        try {
          const currentLng = await LanguageRepository.createQueryBuilder('lng')
            .select(['lng.id', 'lng.name'])
            .where('lng.name ILIKE :name', { name: lng.name })
            .getOneOrFail();
          return ResumeToLanguageRepository.createQueryBuilder()
            .insert()
            .values({ languageLevel: lng.level, language: currentLng, resume })
            .execute();
        } catch {
          return Promise.resolve();
        }
      }),
    );
  },
});
