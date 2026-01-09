import { SetMetadata } from '@nestjs/common';

export const METADATA_KEY = {
  IS_PUBLIC: 'isPublic',
  ROLES: 'roles',
};

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);

export const Roles = (...roles: string[]) =>
  SetMetadata(METADATA_KEY.ROLES, roles);
