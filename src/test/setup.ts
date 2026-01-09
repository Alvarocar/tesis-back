/**
 * Setup global para todos los tests
 * Este archivo se ejecuta una vez antes de todos los tests
 */

// Mock de bcrypt global
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hashSync: jest.fn().mockReturnValue('hashed-password-sync'),
  compareSync: jest.fn().mockReturnValue(true),
}));

// Mock de crypto para tokens predecibles en tests
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-token-123456'),
  }),
}));

// Configuración de timezone para tests consistentes
process.env.TZ = 'UTC';

// Aumentar timeout por defecto para tests con BD
jest.setTimeout(10000);
