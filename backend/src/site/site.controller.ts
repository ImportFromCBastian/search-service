import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { SiteCreatedResponseDto, SiteResponseDto } from './dto/site-response.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteService } from './site.service';

@ApiTags('sites')
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo sitio e iniciar automáticamente su primer snapshot',
  })
  @ApiResponse({
    status: 201,
    description:
      'Sitio registrado exitosamente. Incluye la API Key secreta en texto plano (única vez).',
    type: SiteCreatedResponseDto,
  })
  async create(@CurrentUser() userId: Types.ObjectId, @Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(userId, createSiteDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar todos los sitios del usuario actual con paginación y estado del último snapshot',
  })
  @ApiResponse({ status: 200, description: 'Listado de sitios', type: [SiteResponseDto] })
  async findAll(@CurrentUser() userId: Types.ObjectId, @Query() pagination: PaginationDto) {
    return this.siteService.findAll(userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar configuración detallada de un sitio por ID' })
  @ApiParam({ name: 'id', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Detalle del sitio', type: SiteResponseDto })
  async findOne(@CurrentUser() userId: Types.ObjectId, @Param('id') id: string) {
    return this.siteService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar configuración, URL o funciones de extracción de un sitio' })
  @ApiParam({ name: 'id', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Sitio actualizado', type: SiteResponseDto })
  async update(
    @CurrentUser() userId: Types.ObjectId,
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.update(userId, id, updateSiteDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un sitio junto con todos sus snapshots, logs y documentos indexados',
  })
  @ApiParam({ name: 'id', description: 'ID del sitio' })
  async remove(@CurrentUser() userId: Types.ObjectId, @Param('id') id: string) {
    return this.siteService.remove(userId, id);
  }

  @Post(':id/regenerate-api-key')
  @ApiOperation({ summary: 'Invalidar y regenerar una nueva API Key para el sitio' })
  @ApiParam({ name: 'id', description: 'ID del sitio' })
  async regenerateApiKey(@CurrentUser() userId: Types.ObjectId, @Param('id') id: string) {
    return this.siteService.regenerateApiKey(userId, id);
  }
}
