import { Resume } from 'src/resume/entities/resume.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class ResumeTemplateDto {
  private resume: Resume;

  constructor(resume: Resume) {
    this.resume = resume;
  }

  private getExperiences() {
    const experiences = this.resume.experiences
      ?.map(
        (exp) =>
          `\t\t- ${exp.rol} (${DateUtil.toString(exp.startDate)}-${exp.endDate ? DateUtil.toString(exp.endDate) : 'actual'}) ${exp.description}`,
      )
      ?.join('\n');
    if (!experiences) return '';
    return `\texperiencia:\n${experiences}`;
  }

  private getStudies() {
    const education = this.resume.educations
      ?.map(
        (edu) =>
          `\t\t- ${edu.institute} (${DateUtil.toString(edu.startDate)}-${edu.endDate ? DateUtil.toString(edu.endDate) : 'actual'}) ${edu.title}`,
      )
      ?.join('\n');
    if (!education) return '';
    return `\teducación:\n${education}`;
  }

  private getLanguages() {
    const languages = this.resume.resumeLanguage
      ?.map((ln) => `\t\t- ${ln.language.name}: ${ln.languageLevel}`)
      ?.join('\n');
    if (!languages) return '';
    return `\tidioma:\n${languages}`;
  }

  private getSkills() {
    const skills = this.resume.skills?.map((skll) => `\t\t- ${skll.name}`);
    if (!skills) return '';
    return `\tHabilidades o Conocimientos:\n${skills.join(', ')}`;
  }

  getDescription() {
    return this.resume.aboutMe;
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
