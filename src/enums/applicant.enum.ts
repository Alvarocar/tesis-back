export enum EApplicant {
  SIGN_UP = 'Aspirante creado',
  ERROR_CREATE_APPLICANT = 'No se pudo crear un nuevo aspirante',
  ERROR_DUPLICATE_EMAIL = 'Este email ya se encuentra registrado',
  ERROR_NOT_FOUND = 'Aspirante no encontrado',
  ERROR_NOT_MATCH_ACCOUNT = 'El email o contraseña son incorrectos',
  ERROR_GENERIC = 'Hubo un error en la solicitud',
}

export enum EIdentificationType {
  DNI = 'DNI',
  CEDULA = 'Cédula',
  TARJETA_DE_IDENTIDAD = 'Tarjeta de identidad',
}
