import { LanguageService } from '@/services/language.service';
import { Controller, Get, Param } from 'routing-controllers';

@Controller('/v1/language')
export class LanguageController {
  private languageService = new LanguageService();

  @Get('/search')
  getLanguagesByTerm(@Param('term') term = '') {
    return this.languageService.getLanguageByTerm(term);
  }

  @Get('/')
  getLanguages() {
    return this.languageService.getAll();
  }
}
