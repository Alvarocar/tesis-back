export interface BenchmarkResultDto {
  applicationId: number;
  affinity: number;
  feedBack: string;
  inputTokens: number;
  outputTokens: number;
  durationSecs: number;
  model: string;
}

export interface AnalyzedApplicationOverviewDto {
  id: number;
  vacancyTitle: string;
  applicantName: string;
  creationDate: Date;
}
