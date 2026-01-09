/**
 * Mocks comunes para servicios externos
 */

/**
 * Mock del MailService
 */
export const mockMailService = {
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
};

/**
 * Mock del SecurityService
 */
export const mockSecurityService = {
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn().mockResolvedValue(true),
  compareHash: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockReturnValue('mocked-token-123'),
  verifyToken: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
  signToken: jest.fn().mockResolvedValue('mocked-jwt-token'),
};

/**
 * Mock de Jose JWT
 */
export const mockJoseJWT = {
  sign: jest.fn().mockResolvedValue('mocked-jwt-token'),
  verify: jest.fn().mockResolvedValue({
    payload: { sub: '1', email: 'test@example.com' },
  }),
};

/**
 * Mock del LLM Client
 */
export const mockLlmClient = {
  generateText: jest.fn().mockResolvedValue('Generated text response'),
  analyze: jest.fn().mockResolvedValue({ score: 0.85, summary: 'Good match' }),
};

/**
 * Reset de todos los mocks
 */
export function resetAllMocks(): void {
  Object.values(mockMailService).forEach((mock) => mock.mockClear());
  Object.values(mockSecurityService).forEach((mock) => mock.mockClear());
  Object.values(mockLlmClient).forEach((mock) => mock.mockClear());
  Object.values(mockJoseJWT).forEach((mock) => mock.mockClear());
}
