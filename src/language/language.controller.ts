import { Controller, Get, Param } from '@nestjs/common';
import { LanguageService } from './language.service';

@Controller('v1/language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('/search')
  async searchLanguages(@Param('term') term: string) {
    return this.languageService.search(term);
  }

  @Get()
  getAll() {
    return this.languageService.getAll();
  }
}
