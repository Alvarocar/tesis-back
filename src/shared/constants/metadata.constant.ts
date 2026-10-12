import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';

export const METADATA_KEY = {
  IS_PUBLIC: 'isPublic',
  ROLES: 'roles',
};

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);

export const Roles = (...roles: Role[]) =>
  SetMetadata(METADATA_KEY.ROLES, roles);
