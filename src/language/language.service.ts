import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguageOverviewDto } from './dto/language-overview.dto';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
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
}
