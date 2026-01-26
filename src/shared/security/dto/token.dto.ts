import { Role } from 'src/shared/enums/role.enum';

export class TokenDto {
  exp?: number;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  companyId?: number;
}
