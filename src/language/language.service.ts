import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguageOverviewDto } from './dto/language-overview.dto';
import { Resume } from 'src/resume/entities/resume.entity';
import { LanguageDto } from 'src/resume/dto/resume-detail.dto';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { ResumeLanguage } from 'src/resume/entities/resume-language.entity';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(ResumeLanguage)
    private readonly resumeLanguageRepository: Repository<ResumeLanguage>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async search(term: string) {
    try {
      const languages = await this.languageRepository
        .createQueryBuilder('lan')
        .select(['lan.id', 'lan.name'])
        .where('lan.name ILIKE :term', { term: `%${term}%` })
        .getMany();
      const result: LanguageOverviewDto[] = languages.map(({ id, name }) => ({
        id,
        name,
      }));
      return result;
    } catch {
      const result_1: LanguageOverviewDto[] = [];
      return result_1;
    }
  }

  async getAll() {
    const languages = await this.languageRepository.find();
    const result: LanguageOverviewDto[] = languages.map(({ id, name }) => ({
      id,
      name,
    }));
    return result;
  }

  async getByResume(resumeId: number) {
    const languages = await this.resumeLanguageRepository.find({
      select: ['id', 'language', 'languageLevel'],
      where: { resume: { id: resumeId } },
      relations: ['language'],
    });

    return languages
      .filter((l) => l.language !== null)
      .map<LanguageDto>((l) => ({
        id: l.language.id,
        name: l.language.name,
        level: l.languageLevel,
      }));
  }

  async createOrUpdateForApplicant(
    resumeId: number,
    languages: LanguageDto[],
    user: TokenDto,
  ) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const currentLanguages = await this.resumeLanguageRepository.find({
      where: { resume: { id: resumeId } },
      relations: ['language'],
    });

    const languagesToRemove = currentLanguages.filter(
      (lang) => !languages.some((l) => l.id === lang.language?.id),
    );

    if (languagesToRemove.length > 0) {
      await this.resumeLanguageRepository.remove(languagesToRemove);
    }

    const DBlanguages = await this.languageRepository.findBy({
      name: In(languages.map((l) => l.name)),
    });

    const mapLanguages = DBlanguages.reduce<Record<string, Language>>(
      (acc, lang) => {
        acc[lang.name] = lang;
        return acc;
      },
      {},
    );

    const languagesToSave = languages.map((languageDto) => {
      return this.resumeLanguageRepository.create({
        id: languageDto.id,
        languageLevel: languageDto.level,
        language: mapLanguages[languageDto.name],
        resume,
      });
    });

    await this.resumeLanguageRepository.save(languagesToSave);

    return this.getByResume(resumeId);
  }
}
