import { Skill } from 'src/shared/entities/skill.entity';
import { LaboralReference } from './laboral-reference';
import { Experience } from './experience';
import { Education } from './education';
import { Language } from '../../language/entities/language.entity';

export class Resume {
  constructor(
    public readonly id: number | string,
    public readonly aboutMe: string,
    public readonly skills: Skill[],
    public readonly educations: Education[],
    public readonly experiences: Experience[],
    public readonly languages: Language[],
    public readonly laboralReferences: LaboralReference[],
  ) {}
}
