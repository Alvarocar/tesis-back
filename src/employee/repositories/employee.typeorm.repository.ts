import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type CreateEmployeeData,
  type EmployeeListRow,
  type EmployeeRepositoryPort,
  type EmployeeWithCompanyId,
} from './employee.repository';

@Injectable()
export class EmployeeTypeOrmRepository implements EmployeeRepositoryPort {
  private readonly logger = new StructuredLogger('EmployeeRepository');

  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async insert(data: CreateEmployeeData): Promise<EmployeeWithCompanyId> {
    return this.logger.timed(
      'employee.repo.insert',
      async () => {
        const entity = this.repo.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          companyId: data.companyId,
          invitationToken: data.invitationToken,
          invitationTokenExpires: data.invitationTokenExpires,
          creationDate: new Date(),
          modificationDate: new Date(),
          isActive: true,
        } as unknown as Employee);
        await this.repo.insert(entity);
        return this.toDomain(entity);
      },
      { email: data.email },
    );
  }

  async findById(id: number): Promise<EmployeeWithCompanyId | null> {
    return this.repo
      .findOne({ where: { id } })
      .then((e) => (e ? this.toDomain(e) : null));
  }

  async findByEmail(email: string): Promise<EmployeeWithCompanyId | null> {
    return this.logger.timed(
      'employee.repo.findByEmail',
      async () => {
        const e = await this.repo.findOne({ where: { email } });
        return e ? this.toDomain(e) : null;
      },
      { email },
    );
  }

  async findByInvitationToken(
    token: string,
  ): Promise<EmployeeWithCompanyId | null> {
    return this.logger.timed('employee.repo.findByToken', async () => {
      const e = await this.repo.findOne({ where: { invitationToken: token } });
      return e ? this.toDomain(e) : null;
    });
  }

  async findByCompanyAndId(
    id: number,
    companyId: number,
  ): Promise<EmployeeWithCompanyId | null> {
    return this.repo
      .findOne({ where: { id, companyId, isActive: true } })
      .then((e) => (e ? this.toDomain(e) : null));
  }

  private toDomain(e: Employee): EmployeeWithCompanyId {
    return {
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName ?? '',
      email: e.email,
      role: e.role,
      companyId: e.companyId,
      invitationToken: e.invitationToken ?? null,
      invitationTokenExpires: e.invitationTokenExpires ?? null,
      isActive: e.isActive,
      password: e.password ?? null,
    };
  }

  async validateOwnership(
    employeeId: number,
    companyId: number,
  ): Promise<boolean> {
    return this.repo.exists({ where: { id: employeeId, companyId } });
  }

  async searchByCompany(
    companyId: number,
    pagination: { page: number; pageSize: number },
  ): Promise<{ data: EmployeeListRow[]; total: number }> {
    return this.logger.timed(
      'employee.repo.searchByCompany',
      async () => {
        const dataPromise = this.repo
          .createQueryBuilder('employee')
          .select([
            'employee.id',
            'employee.firstName',
            'employee.lastName',
            'employee.email',
            'employee.role',
            // password NO se selecciona (evita leak + ancho de banda).
          ])
          .where('employee.companyId = :companyId', { companyId })
          .andWhere('employee.isActive = :isActive', { isActive: true })
          .orderBy('employee.creationDate', 'DESC')
          .take(pagination.pageSize)
          .skip((pagination.page - 1) * pagination.pageSize)
          .getMany();
        const totalPromise = this.repo.count({
          where: { companyId, isActive: true },
        });

        const [rows, total] = await Promise.all([dataPromise, totalPromise]);

        // Para derivar `hasAccount` se hace una segunda consulta puntual
        // por los IDs traídos en la primera. Sigue siendo N+1 acotado a 1
        // query (depende del N de la página, NO del total).
        const ids = rows.map((r) => r.id);
        const idHasPassword =
          ids.length === 0
            ? new Map<number, boolean>()
            : await this.repo
                .createQueryBuilder('e')
                .select('e.id', 'id')
                .addSelect(
                  'CASE WHEN e.password IS NOT NULL THEN true ELSE false END',
                  'hasPassword',
                )
                .where('e.id IN (:...ids)', { ids })
                .getRawMany<{ id: number; hasPassword: boolean }>()
                .then((r) => new Map(r.map((m) => [m.id, m.hasPassword])));

        const data: EmployeeListRow[] = rows.map((row) => ({
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName ?? '',
          email: row.email,
          role: row.role,
          hasAccount: idHasPassword.get(row.id) === true,
        }));

        return { data, total };
      },
      { companyId },
    );
  }

  async setInvitationToken(
    employeeId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repo.update(
      { id: employeeId },
      { invitationToken: token, invitationTokenExpires: expiresAt },
    );
  }

  async clearInvitationToken(employeeId: number): Promise<void> {
    await this.repo.update(
      { id: employeeId },
      { invitationToken: null, invitationTokenExpires: null },
    );
  }

  async setPassword(employeeId: number, hashedPassword: string): Promise<void> {
    await this.repo.update(
      { id: employeeId },
      { password: hashedPassword, isActive: true },
    );
  }

  async delete(employeeId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Employee, { id: employeeId });
    });
  }

  async reassignVacancies(
    fromEmployeeId: number,
    toEmployeeId: number,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update('vacancy')
      .set({ employee_id: toEmployeeId })
      .where('employee_id = :fromEmployeeId', { fromEmployeeId })
      .execute();
  }
}
