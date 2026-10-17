import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import type { AuthUser } from '../../authz/auth-user.interface';

export const DEFAULT_USER_ID = new Types.ObjectId('66f000000000000000000001');

export type CurrentUserProperty = keyof AuthUser | 'user' | 'all';

/**
 * Decorador para inyectar datos del usuario autenticado en los controladores.
 *
 * - `@CurrentUser()`: Retorna por defecto `user.userId` (Types.ObjectId) para compatibilidad con servicios y Mongoose.
 * - `@CurrentUser('sub')`: Retorna el identificador de Auth0.
 * - `@CurrentUser('email')`: Retorna el email del usuario.
 * - `@CurrentUser('user')` / `@CurrentUser('all')`: Retorna el objeto completo `AuthUser`.
 */
export const CurrentUser = createParamDecorator(
  (prop: CurrentUserProperty | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      // Soporte para pruebas locales / scripts en desarrollo si se provee x-user-id
      if (process.env.NODE_ENV !== 'production' && request.headers?.['x-user-id']) {
        const headerId = request.headers['x-user-id'];
        if (typeof headerId === 'string' && Types.ObjectId.isValid(headerId)) {
          return prop === 'user' || prop === 'all'
            ? {
                userId: new Types.ObjectId(headerId),
                sub: `dev|${headerId}`,
                payload: {},
              }
            : new Types.ObjectId(headerId);
        }
      }

      throw new UnauthorizedException('Usuario no autenticado en la solicitud actual.');
    }

    if (prop === 'user' || prop === 'all') {
      return user;
    }

    if (prop) {
      return user[prop];
    }

    // Por defecto, retorna el Types.ObjectId asociado al usuario
    return user.userId;
  },
);

/**
 * Decorador dedicado para obtener el objeto completo `AuthUser`.
 */
export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado en la solicitud actual.');
    }

    return user;
  },
);
