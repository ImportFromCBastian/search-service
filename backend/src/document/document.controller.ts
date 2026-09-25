import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CurrentSite } from '../shared/decorators/current-site.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import { ParseObjectIdPipe } from '../shared/pipes/parse-object-id.pipe';
import type { SiteDocument } from '../site/entities/site.entity';
import { DocumentService } from './document.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import { QueryDocumentDto } from './dto/query-document.dto';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar y buscar documentos indexados del usuario con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de documentos',
    type: [DocumentResponseDto],
  })
  async findAll(@CurrentUser() userId: Types.ObjectId, @Query() query: QueryDocumentDto) {
    return this.documentService.findAll(userId, query);
  }

  @Get('public/search')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'API Pública de búsqueda en vivo para sitios web cliente (autenticado por x-api-key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda en el snapshot activo',
    type: [DocumentResponseDto],
  })
  async searchPublic(@CurrentSite() site: SiteDocument, @Query() query: QueryDocumentDto) {
    return this.documentService.searchPublic(site._id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un documento indexado' })
  @ApiParam({ name: 'id', description: 'ID del documento (ObjectId)' })
  @ApiResponse({ status: 200, description: 'Detalle del documento', type: DocumentResponseDto })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  async findOne(
    @CurrentUser() userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.documentService.findOne(userId, id);
  }
}
