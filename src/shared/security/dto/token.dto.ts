import { Role } from "src/shared/enums/role.enum";

export class TokenDto {
    id: number;
    firstName: string;
    lastName: string
    email: string;
    role: Role;
    companyId?: number;
}