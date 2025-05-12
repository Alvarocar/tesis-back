export interface IAmqpEvents {
  'applicant.apply': { input: { applicationId: number; resumeId: number; vacantId: number; applicantId: number }; output: void };
}
