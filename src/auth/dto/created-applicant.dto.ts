export class CreatedApplicantDto {
  readonly id: number
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly token: string

  constructor(dto: CreatedApplicantDto) {
    Object.assign(this, dto);
  }
}