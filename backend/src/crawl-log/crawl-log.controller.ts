import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrawlLogService } from './crawl-log.service';
import { CrawlLogResponseDto } from './dto/crawl-log-response.dto';
import { QueryCrawlLogDto } from './dto/query-crawl-log.dto';

@ApiTags('crawl-logs')
@Controller('crawl-logs')
export class CrawlLogController {
  constructor(private readonly crawlLogService: CrawlLogService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar logs técnicos y eventos de crawling con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de logs', type: [CrawlLogResponseDto] })
  async findAll(@Query() query: QueryCrawlLogDto) {
    return this.crawlLogService.findAll(query);
  }
}

