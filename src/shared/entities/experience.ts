export class Experience {
  constructor(
    public readonly company: string,
    public readonly position: string,
    public readonly description?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
