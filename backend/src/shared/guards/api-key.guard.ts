import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SiteService } from '../../site/site.service';
import { hashApiKey } from '../utils/api-key.util';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly siteService: SiteService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API Key ausente. Provee el header x-api-key.');
    }

    const hash = hashApiKey(apiKey);
    const site = await this.siteService.findByApiKeyHash(hash);

    if (!site) {
      throw new UnauthorizedException('API Key inválida o no registrada.');
    }

    request.site = site;
    return true;
  }
}
