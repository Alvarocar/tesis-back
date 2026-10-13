import { Role } from 'src/shared/enums/role.enum';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

/**
 * Política única de `editable` para una vacante.
 *
 * Regla:
 *   - Visitor / Applicant -> false.
 *   - Admin        -> true si y solo si su companyId coincide con el de la
 *                       vacante.
 *   - Employee     -> true si y solo si es el dueño (employeeOwnerId).
 *
 * Usada tanto por el listado (SearchJobsUseCase) como por el detalle
 * (FindJobDetailUseCase) para que la regla nunca quede duplicada.
 */
export function isJobEditable(
  user: TokenDto | undefined,
  job: { employeeOwnerId: number; companyId: number | null },
): boolean {
  if (!user) return false;
  if (user.role === Role.Applicant) return false;

  if (user.role === Role.Admin) {
    return job.companyId !== null && user.companyId === job.companyId;
  }

  // Employee (default role).
  return user.id === job.employeeOwnerId;
}
