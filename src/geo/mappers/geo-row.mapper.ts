import type { CityDto, CountryDto, DepartmentDto } from '../dto/geo-option.dto';

/**
 * Mappers from raw QueryBuilder rows (snake_case columns, possibly with
 * joins to other geo tables) into the public DTOs exposed by the geo module.
 *
 * These functions tolerate partial input: any field that is missing or null
 * becomes `null` in the resulting DTO. This keeps them safe to call on
 * LEFT JOINs that produced no row for a given FK.
 */
type RawRow = Record<string, unknown>;

const readNumber = (row: RawRow, key: string): number | null => {
  const value = row[key];
  if (value === null || value === undefined) return null;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : null;
};

const readString = (row: RawRow, key: string): string | null => {
  const value = row[key];
  if (value === null || value === undefined) return null;
  return String(value);
};

export const toCountryDto = (row: RawRow | null | undefined): CountryDto | null => {
  if (!row) return null;
  const id = readNumber(row, 'id');
  if (id == null) return null;
  return {
    id,
    name: readString(row, 'name') ?? '',
    code: readString(row, 'code') ?? '',
  };
};

export const toDepartmentDto = (
  row: RawRow | null | undefined,
): DepartmentDto | null => {
  if (!row) return null;
  const id = readNumber(row, 'id');
  const countryId = readNumber(row, 'country_id');
  if (id == null || countryId == null) return null;
  return {
    id,
    name: readString(row, 'name') ?? '',
    code: readString(row, 'code') ?? '',
    countryId,
  };
};

export const toCityDto = (row: RawRow | null | undefined): CityDto | null => {
  if (!row) return null;
  const id = readNumber(row, 'id');
  const countryId = readNumber(row, 'country_id');
  const departmentId = readNumber(row, 'department_id');
  if (id == null || countryId == null || departmentId == null) return null;
  return {
    id,
    name: readString(row, 'name') ?? '',
    type: readString(row, 'type'),
    countryId,
    departmentId,
  };
};
