import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from './auth-user.interface';
import { UserIdentityResolver } from './user-identity-resolver';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userIdentityResolver: UserIdentityResolver,
  ) {
    const rawIssuer = configService.get<string>('AUTH0_ISSUER_URL', '');
    const issuer = rawIssuer.endsWith('/') ? rawIssuer : `${rawIssuer}/`;
    const audience = configService.get<string>('AUTH0_AUDIENCE', '');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Record<string, unknown>): AuthUser {
    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Payload de token inválido');
    }

    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) {
      throw new UnauthorizedException('Token inválido: claim "sub" requerido');
    }

    // Soporte para claims personalizados de userId (namespace de la API o directo)
    const customUserId =
      (payload[`${process.env.AUTH0_AUDIENCE}/userId`] as string | undefined) ??
      (payload.userId as string | undefined) ??
      (payload.user_id as string | undefined);

    const userId = this.userIdentityResolver.resolve(sub, customUserId);

    return {
      userId,
      sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      scope: typeof payload.scope === 'string' ? payload.scope : undefined,
      payload,
    };
  }
}