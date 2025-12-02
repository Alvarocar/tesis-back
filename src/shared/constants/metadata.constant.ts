import { SetMetadata } from "@nestjs/common";

export const METADATA_KEY = {
  IS_PUBLIC: 'isPublic',
};

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);
