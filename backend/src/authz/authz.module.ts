import { type MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthMiddleware } from './jwt-auth.middleware';
import { UserIdentityResolver } from './user-identity-resolver';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [UserIdentityResolver, JwtStrategy, JwtAuthMiddleware],
  exports: [PassportModule, UserIdentityResolver, JwtStrategy, JwtAuthMiddleware],
})
export class AuthzModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        // Raíz / redirect hacia documentación
        { path: '', method: RequestMethod.GET },
        // Documentación Swagger / OpenAPI y recursos estáticos
        { path: 'api', method: RequestMethod.ALL },
        { path: 'api/(.*)', method: RequestMethod.ALL },
        // Endpoints públicos autenticados mediante x-api-key en vez de JWT de usuario
        { path: 'documents/public/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
