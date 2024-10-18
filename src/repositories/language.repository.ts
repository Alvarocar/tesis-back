import { AppDataSource } from '@/data-source';
import { Language } from '@/models/language.model';
import { Resume } from '@/models/resume.model';
import { ResumeToLanguageRepository } from './resumeToLanguage.repository';

export const LanguageRepository = AppDataSource.getRepository(Language).extend({
  getByResume: (resume: Resume) => {
    return ResumeToLanguageRepository.createQueryBuilder('r2l')
      .select(['r2l.id', 'r2l.language_level'])
      .addSelect(['lng.name'])
      .innerJoin('r2l.language', 'lng')
      .where('r2l.resumeId = :id', { id: resume.id })
      .getMany()
      .then(lngs => lngs.map(ln => ({ name: ln.language.name, level: ln.language_level, id: ln.id })));
  },
});
