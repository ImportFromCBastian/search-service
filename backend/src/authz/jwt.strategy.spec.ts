import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { JwtStrategy } from './jwt.strategy';
import { UserIdentityResolver } from './user-identity-resolver';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => () => {}),
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: Partial<ConfigService>;
  let resolver: UserIdentityResolver;

  beforeEach(() => {
    
    resolver = new UserIdentityResolver();
    strategy = new JwtStrategy(mockConfigService as ConfigService, resolver);
  });

  it('should validate and transform a valid Auth0 JWT payload', () => {
    const payload = {
      sub: 'auth0|66f000000000000000000001',
      email: 'test@example.com',
      scope: 'openid profile email',
    };

    const result = strategy.validate(payload);

    expect(result).toBeDefined();
    expect(result.sub).toBe(payload.sub);
    expect(result.email).toBe(payload.email);
    expect(result.userId).toEqual(new Types.ObjectId('66f000000000000000000001'));
    expect(result.payload).toEqual(payload);
  });

  it('should support custom claim namespace for userId', () => {
    const customId = '66f000000000000000000099';
    const payload = {
      sub: 'google-oauth2|1234567890',
      'https://search-service-api.demo.com/userId': customId,
    };

    const result = strategy.validate(payload);
    expect(result.userId).toEqual(new Types.ObjectId(customId));
  });

  it('should throw UnauthorizedException if sub is missing', () => {
    expect(() => strategy.validate({})).toThrow(UnauthorizedException);
  });
});
