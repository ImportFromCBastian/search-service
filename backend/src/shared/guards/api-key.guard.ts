import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, type SiteDocument } from '../../site/entities/site.entity';
import { hashApiKey } from '../utils/api-key.util';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API Key ausente. Provee el header x-api-key.');
    }

    const hash = hashApiKey(apiKey);
    const site = await this.siteModel.findOne({ apiKeyHash: hash }).exec();

    if (!site) {
      throw new UnauthorizedException('API Key inválida o no registrada.');
    }

    request.site = site;
    return true;
  }
}

