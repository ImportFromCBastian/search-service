import type { Types } from 'mongoose';

/**
 * Representa el usuario autenticado en el contexto de la aplicación,
 * integrando la identidad de Auth0 (sub) con la relación interna de MongoDB (userId).
 */
export interface AuthUser {
  /** ObjectId de MongoDB asignado de forma determinista o mapeada para relaciones de datos */
  userId: Types.ObjectId;

  /** Identificador único del sujeto emitido por Auth0 (ej. 'auth0|123', 'google-oauth2|456') */
  sub: string;

  /** Correo electrónico si fue incluido en los claims del token */
  email?: string;

  /** Scopes/permisos autorizados en el token */
  scope?: string;

  /** Payload completo decodificado del JWT para acceso a claims personalizados */
  payload: Record<string, unknown>;
}