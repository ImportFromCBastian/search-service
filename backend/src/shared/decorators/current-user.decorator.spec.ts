import type { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Types } from 'mongoose';
import type { AuthUser } from '../../authz/auth-user.interface';
import { CurrentAuthUser, CurrentUser } from './current-user.decorator';

function getParamDecoratorFactory(decorator: (...args: unknown[]) => ParameterDecorator) {
  class TestController {
    testMethod(@decorator() _value: unknown) {}
  }

  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'testMethod');
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

function getParamDecoratorFactoryWithArg(
  decorator: (arg?: unknown) => ParameterDecorator,
  arg: unknown,
) {
  class TestController {
    testMethod(@decorator(arg) _value: unknown) {}
  }

  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'testMethod');
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

describe('CurrentUser Decorator', () => {
  const mockUser: AuthUser = {
    userId: new Types.ObjectId('66f000000000000000000001'),
    sub: 'auth0|66f000000000000000000001',
    email: 'test@search-service.com',
    scope: 'read:sites',
    payload: { sub: 'auth0|66f000000000000000000001' },
  };

  const createMockContext = (user?: AuthUser, headers: Record<string, string> = {}) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          headers,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should return user.userId by default when called without arguments', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const ctx = createMockContext(mockUser);

    const result = factory(undefined, ctx);
    expect(result).toEqual(mockUser.userId);
  });

  it('should return specific property when property name is provided', () => {
    const subFactory = getParamDecoratorFactoryWithArg(CurrentUser, 'sub');
    const emailFactory = getParamDecoratorFactoryWithArg(CurrentUser, 'email');
    const userIdFactory = getParamDecoratorFactoryWithArg(CurrentUser, 'userId');
    const ctx = createMockContext(mockUser);

    expect(subFactory('sub', ctx)).toBe(mockUser.sub);
    expect(emailFactory('email', ctx)).toBe(mockUser.email);
    expect(userIdFactory('userId', ctx)).toEqual(mockUser.userId);
  });

  it('should return the full AuthUser when "user" or "all" is specified', () => {
    const userFactory = getParamDecoratorFactoryWithArg(CurrentUser, 'user');
    const ctx = createMockContext(mockUser);

    expect(userFactory('user', ctx)).toEqual(mockUser);
  });

  it('should support CurrentAuthUser decorator to return full user object', () => {
    const factory = getParamDecoratorFactory(CurrentAuthUser);
    const ctx = createMockContext(mockUser);

    expect(factory(undefined, ctx)).toEqual(mockUser);
  });

  it('should support development header fallback when NODE_ENV is not production', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const devId = '66f000000000000000000099';
    const ctx = createMockContext(undefined, { 'x-user-id': devId });

    const result = factory(undefined, ctx);
    expect(result).toEqual(new Types.ObjectId(devId));
  });

  it('should throw UnauthorizedException when user is not present and no dev header exists', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const ctx = createMockContext(undefined, {});

    expect(() => factory(undefined, ctx)).toThrow();
  });
});
