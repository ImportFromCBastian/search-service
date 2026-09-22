import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export const DEFAULT_USER_ID = new Types.ObjectId('66f000000000000000000001');

/**
 * Decorador que extrae el userId actual de la petición.
 * Lee del header 'x-user-id' o fallback a un ObjectId de desarrollo
 * para facilitar pruebas locales y frontend hasta la integración de Auth completa.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Types.ObjectId => {
    const request = ctx.switchToHttp().getRequest();
    const userIdHeader = request.headers['x-user-id'];

    if (userIdHeader && Types.ObjectId.isValid(userIdHeader as string)) {
      return new Types.ObjectId(userIdHeader as string);
    }

    return DEFAULT_USER_ID;
  },
);

