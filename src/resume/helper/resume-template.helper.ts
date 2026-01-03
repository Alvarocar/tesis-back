import { DomUtil } from "src/shared/utils/dom.util";
import { Resume } from "../entities/resume.entity";

export class ResumeTemplateHelper {
  private resume: Resume;

  /**
   * 
   * @param resume The resume entity should have relations loaded: experiences, educations, resumeLanguage.language, skills
   */
  constructor(resume: Resume) {
    this.resume = resume;
  }

  private getExperiences() {
    const experiences = this.resume.experiences
      ?.map(exp => `\t\t- ${exp.rol} (${exp.startDate}-${exp.endDate ?? 'actual'}) ${exp.description}`)
      ?.join('\n');
    if (!experiences) return '';
    return `\texperiencia:\n${experiences}`;
  }

  private getStudies() {
    const education = this.resume.educations
      ?.map(edu => `\t\t- ${edu.institute} (${edu.startDate}-${edu.endDate ?? 'actual'}) ${edu.title}`)
      ?.join('\n');
    if (!education) return '';
    return `\teducación:\n${education}`;
  }

  private getLanguages() {
    const languages = this.resume.resumeLanguage?.map(ln => `\t\t- ${ln.language.name}: ${ln.languageLevel}`)?.join('\n');
    if (!languages) return '';
    return `\tidioma:\n${languages}`;
  }

  private getSkills() {
    const skills = this.resume.skills?.map(skll => `\t\t- ${skll.name}`);
    if (!skills) return '';
    return `\tHabilidades o Conocimientos:\n${skills}`;
  }

  getDescription() {
    const rawDescription = DomUtil.sanitizeHtml(this.resume.aboutMe);
    const container = window.document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }

  getTemplate() {
    return `
      descripción:
      ${this.getDescription() || 'no hay descripción'}
      ${this.getStudies()}
      ${this.getExperiences()}
      ${this.getLanguages()}
      ${this.getSkills()}
    `;
  }
}