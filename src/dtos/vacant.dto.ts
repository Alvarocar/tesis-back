import { Vacant } from '@/models/vacant.model';
import { purify, window } from '@/utils/dom.util';

export class VacantTemplateDto {
  private vacant: Vacant;

  constructor(vacant: Vacant) {
    this.vacant = vacant;
  }

  private getVacantTitle() {
    return this.vacant.title;
  }

  private getVacantDetail() {
    const rawDescription = purify.sanitize(this.vacant.description);
    const container = window.document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }

  getTemplate() {
    return `
      ${this.getVacantTitle()}
      ${this.getVacantDetail()}
    `;
  }
}
