import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Contrato polimórfico para estrategias de resolución de identidad de usuario.
 */
export interface IdentityResolutionStrategy {
  supports(sub: string, customUserId?: string): boolean;
  resolve(sub: string, customUserId?: string): Types.ObjectId;
}

/**
 * Estrategia 1: Claim personalizado explícito dentro del JWT de Auth0.
 * Permite que Auth0 Actions / Rules inyecten un MongoDB ObjectId específico.
 */
export class CustomClaimStrategy implements IdentityResolutionStrategy {
  supports(_sub: string, customUserId?: string): boolean {
    return Boolean(customUserId && Types.ObjectId.isValid(customUserId));
  }

  resolve(_sub: string, customUserId?: string): Types.ObjectId {
    return new Types.ObjectId(customUserId);
  }
}

/**
 * Estrategia 2: El 'sub' de Auth0 contiene un ObjectId hexadecimal válido de 24 caracteres.
 * Aplica cuando el Auth0 ID sigue el formato 'auth0|<24-hex-chars>' o directamente un ObjectId.
 */
export class SubObjectIdStrategy implements IdentityResolutionStrategy {
  supports(sub: string): boolean {
    const rawId = sub.includes('|') ? sub.split('|')[1] : sub;
    return Types.ObjectId.isValid(rawId) && rawId.length === 24;
  }

  resolve(sub: string): Types.ObjectId {
    const rawId = sub.includes('|') ? sub.split('|')[1] : sub;
    return new Types.ObjectId(rawId);
  }
}

/**
 * Estrategia 3: Hash determinista SHA-256 del 'sub'.
 * Garantiza que cualquier proveedor de identidad externo (Google, GitHub, Auth0 DB con IDs alfanuméricos)
 * genere SIEMPRE el mismo ObjectId válido de 24 caracteres hexadecimales en MongoDB.
 */
export class DeterministicHashStrategy implements IdentityResolutionStrategy {
  supports(): boolean {
    return true;
  }

  resolve(sub: string): Types.ObjectId {
    const hash = createHash('sha256').update(sub).digest('hex').substring(0, 24);
    return new Types.ObjectId(hash);
  }
}

/**
 * Servicio inyectable de resolución de identidades aplicando la cadena de estrategias polimórficas.
 */
@Injectable()
export class UserIdentityResolver {
  private readonly strategies: IdentityResolutionStrategy[] = [
    new CustomClaimStrategy(),
    new SubObjectIdStrategy(),
    new DeterministicHashStrategy(),
  ];

  resolve(sub: string, customUserId?: string): Types.ObjectId {
    for (const strategy of this.strategies) {
      if (strategy.supports(sub, customUserId)) {
        return strategy.resolve(sub, customUserId);
      }
    }
    throw new Error(`No fue posible resolver un ObjectId para el sujeto: ${sub}`);
  }
}
