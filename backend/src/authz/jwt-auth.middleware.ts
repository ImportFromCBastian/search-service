import { Injectable, type NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import type { AuthUser } from './auth-user.interface';

/**
 * Middleware global de autenticación JWT con Auth0.
 * Intercepta las solicitudes entrantes, valida la firma criptográfica RS256 vía JWKS,
 * y adjunta el objeto `AuthUser` en `req.user`.
 */
@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Inicialización resiliente de Passport en Express si aún no está en el objeto de request
    if (!(req as unknown as { _passport?: unknown })._passport) {
      passport.initialize()(req, res, () => {});
    }

    passport.authenticate(
      'jwt',
      { session: false },
      (err: Error | null, user: AuthUser | false, info: { message?: string } | undefined) => {
        if (err) {
          return next(
            new UnauthorizedException(
              err.message || 'Error durante la verificación del token de autenticación',
            ),
          );
        }

        if (!user) {
          const reason = info?.message || 'Token de autenticación ausente o inválido';
          return next(new UnauthorizedException(reason));
        }

        req.user = user;
        next();
      },
    )(req, res, next);
  }
}
