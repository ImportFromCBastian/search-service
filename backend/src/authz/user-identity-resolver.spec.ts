import { Types } from 'mongoose';
import {
  CustomClaimStrategy,
  DeterministicHashStrategy,
  SubObjectIdStrategy,
  UserIdentityResolver,
} from './user-identity-resolver';

describe('UserIdentityResolver & Strategies', () => {
  let resolver: UserIdentityResolver;

  beforeEach(() => {
    resolver = new UserIdentityResolver();
  });

  describe('CustomClaimStrategy', () => {
    const strategy = new CustomClaimStrategy();

    it('should support valid 24-hex ObjectId in customUserId', () => {
      const validId = '66f000000000000000000001';
      expect(strategy.supports('auth0|any', validId)).toBe(true);
      expect(strategy.resolve('auth0|any', validId)).toEqual(new Types.ObjectId(validId));
    });

    it('should not support invalid or missing customUserId', () => {
      expect(strategy.supports('auth0|any', undefined)).toBe(false);
      expect(strategy.supports('auth0|any', 'invalid-id')).toBe(false);
    });
  });

  describe('SubObjectIdStrategy', () => {
    const strategy = new SubObjectIdStrategy();

    it('should support auth0 sub containing a 24-character hex ObjectId', () => {
      const sub = 'auth0|66f000000000000000000001';
      expect(strategy.supports(sub)).toBe(true);
      expect(strategy.resolve(sub)).toEqual(new Types.ObjectId('66f000000000000000000001'));
    });

    it('should support raw 24-character hex ObjectId as sub', () => {
      const sub = '66f000000000000000000001';
      expect(strategy.supports(sub)).toBe(true);
      expect(strategy.resolve(sub)).toEqual(new Types.ObjectId(sub));
    });

    it('should not support non-hex or non-24 length sub', () => {
      expect(strategy.supports('google-oauth2|109283746192837465')).toBe(false);
      expect(strategy.supports('github|12345')).toBe(false);
    });
  });

  describe('DeterministicHashStrategy', () => {
    const strategy = new DeterministicHashStrategy();

    it('should support any sub and produce a deterministic valid 24-hex ObjectId', () => {
      const sub = 'google-oauth2|109283746192837465';
      expect(strategy.supports()).toBe(true);

      const id1 = strategy.resolve(sub);
      const id2 = strategy.resolve(sub);

      expect(Types.ObjectId.isValid(id1)).toBe(true);
      expect(id1.toHexString()).toHaveLength(24);
      expect(id1.equals(id2)).toBe(true);
    });
  });

  describe('UserIdentityResolver polymorphism', () => {
    it('should prioritize custom claim when present', () => {
      const customId = '66f000000000000000000002';
      const resolved = resolver.resolve('auth0|66f000000000000000000001', customId);
      expect(resolved).toEqual(new Types.ObjectId(customId));
    });

    it('should fallback to sub-extracted ObjectId when custom claim is absent', () => {
      const resolved = resolver.resolve('auth0|66f000000000000000000001');
      expect(resolved).toEqual(new Types.ObjectId('66f000000000000000000001'));
    });

    it('should fallback to deterministic hash for third-party providers like Google', () => {
      const googleSub = 'google-oauth2|98765432101234567890';
      const resolved1 = resolver.resolve(googleSub);
      const resolved2 = resolver.resolve(googleSub);

      expect(Types.ObjectId.isValid(resolved1)).toBe(true);
      expect(resolved1.equals(resolved2)).toBe(true);
    });
  });
});
