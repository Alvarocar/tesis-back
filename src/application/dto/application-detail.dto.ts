import { ResumeDetailDto, GeoNameDto } from 'src/resume/dto/resume-detail.dto';
import { VacancyDetailDto } from 'src/vacancy/dto/detail-vacancy.dto';
import { ESex } from 'src/shared/enums/sex.enum';
import { EGender } from 'src/shared/enums/gender.enum';
import { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';

/**
 * Datos de contacto y personales del aspirante, tal como los ve el
 * reclutador en la vista de postulación. Deliberadamente NO incluye
 * `password`, `invitationToken`, `invitationTokenExpires` ni `isActive`
 * (datos de autenticación, no de hoja de vida).
 */
export class ApplicationApplicantDto {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  direction: string | null;
  identification: string | null;
  birthDate: string | null;
  sex: ESex | null;
  genre: EGender | null;
  sexualOrientation: ESexualOrientation | null;
  ethnicGroup: EEthnicGroup | null;
  salaryAspiration: number | null;
  countryOfBirth: GeoNameDto | null;
  departmentOfBirth: GeoNameDto | null;
  cityOfBirth: GeoNameDto | null;
  countryOfResidence: GeoNameDto | null;
  departmentOfResidence: GeoNameDto | null;
  cityOfResidence: GeoNameDto | null;
}

export class ApplicationDetailDto {
  id: number;

  creationDate: string;

  affinity: number;

  feedBack: string;

  /**
   * Hoja de vida delprospecto. `title` conserva el valor de la entidad
   * (campo de edición del prospecto); NO se usa como título en la vista
   * del reclutador — ese es el nombre del aspirante (`applicant`).
   */
  resume: ResumeDetailDto;

  vacancy: VacancyDetailDto;

  applicant: ApplicationApplicantDto;
}
