export class Education {
  constructor(
    public readonly institution: string,
    public readonly degree: string,
    public readonly fieldOfStudy: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
