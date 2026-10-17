import { UnauthorizedException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import passport from 'passport';
import type { AuthUser } from './auth-user.interface';
import { JwtAuthMiddleware } from './jwt-auth.middleware';

describe('JwtAuthMiddleware', () => {
  let middleware: JwtAuthMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    middleware = new JwtAuthMiddleware();
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should attach user to req.user and call next() on successful authentication', () => {
    const authUser: AuthUser = {
      userId: new Types.ObjectId('66f000000000000000000001'),
      sub: 'auth0|66f000000000000000000001',
      email: 'user@domain.com',
      payload: { sub: 'auth0|66f000000000000000000001' },
    };

    jest.spyOn(passport, 'authenticate').mockImplementation(
      (_strategy: unknown, _options: unknown, callback?: unknown) =>
        ((_req: unknown, _res: unknown, _next: unknown) => {
          if (typeof callback === 'function') {
            callback(null, authUser, undefined);
          }
        }) as unknown as ReturnType<typeof passport.authenticate>,
    );

    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(authUser);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with UnauthorizedException when authentication fails (no user)', () => {
    jest.spyOn(passport, 'authenticate').mockImplementation(
      (_strategy: unknown, _options: unknown, callback?: unknown) =>
        ((_req: unknown, _res: unknown, _next: unknown) => {
          if (typeof callback === 'function') {
            callback(null, false, { message: 'No auth token' });
          }
        }) as unknown as ReturnType<typeof passport.authenticate>,
    );

    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    const error = mockNext.mock.calls[0][0] as unknown as UnauthorizedException;
    expect(error.message).toBe('No auth token');
  });

  it('should call next with UnauthorizedException when passport emits an error', () => {
    jest.spyOn(passport, 'authenticate').mockImplementation(
      (_strategy: unknown, _options: unknown, callback?: unknown) =>
        ((_req: unknown, _res: unknown, _next: unknown) => {
          if (typeof callback === 'function') {
            callback(new Error('JWT expired'), false, undefined);
          }
        }) as unknown as ReturnType<typeof passport.authenticate>,
    );

    middleware.use(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    const error = mockNext.mock.calls[0][0] as unknown as UnauthorizedException;
    expect(error.message).toBe('JWT expired');
  });
});
