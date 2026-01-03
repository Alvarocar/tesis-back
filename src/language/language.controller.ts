import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LanguageService } from './language.service';
import { TokenGuard } from 'src/shared/security/guards/token.guard';

@Controller('v1/language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('/search')
  @UseGuards(TokenGuard)
  async searchLanguages(@Param('term') term : string) {
    return this.languageService.search(term);
  }

  @Get()
  getAll() {
    return this.languageService.getAll();
  }
}
