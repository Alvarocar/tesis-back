import { AppDataSource } from '@/data-source';
import { LanguageDto } from '@/dtos/resume.dto';
import { ResumeToLanguage } from '@/models/resume_to_language.model';

export const ResumeToLanguageRepository = AppDataSource.getRepository(ResumeToLanguage).extend({
  createFromDto: (languageDto: LanguageDto) => {
    return ResumeToLanguageRepository.create({
      language: { id: languageDto.id },
      language_level: languageDto.language_level,
    });
  },
});
