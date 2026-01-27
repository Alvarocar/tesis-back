/**
 * DTO for representing an overview of employees.
 */
export class EmployeeOverviewDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hasAccount: boolean;
}
