import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SiteDocument } from '../../site/entities/site.entity';

export const CurrentSite = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SiteDocument => {
    const request = ctx.switchToHttp().getRequest();
    return request.site;
  },
);

