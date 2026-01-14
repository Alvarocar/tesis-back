import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { DomUtil } from 'src/shared/utils/dom.util';

export class VacancyTemplateDto {
  private vacancy: Vacancy;

  constructor(vacancy: Vacancy) {
    this.vacancy = vacancy;
  }

  private getVacancyTitle() {
    return this.vacancy.title;
  }

  private getVacancyDetail() {
    const rawDescription = DomUtil.sanitizeHtml(this.vacancy.description);
    const container = DomUtil.getWindow().document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }

  getTemplate() {
    return `
      ${this.getVacancyTitle()}
      ${this.getVacancyDetail()}
    `;
  }
}
