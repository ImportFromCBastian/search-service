import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { SnapshotResponseDto } from './dto/snapshot-response.dto';
import { SnapshotService } from './snapshot.service';

@ApiTags('snapshots')
@Controller('snapshots')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post()
  @ApiOperation({ summary: 'Disparar un nuevo snapshot para un sitio (sólo permitido si no hay otro activo)' })
  @ApiResponse({ status: 201, description: 'Snapshot iniciado exitosamente', type: SnapshotResponseDto })
  async create(@CurrentUser() userId: Types.ObjectId, @Body() createSnapshotDto: CreateSnapshotDto) {
    return this.snapshotService.create(userId, createSnapshotDto);
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'Listar el historial cronológico de snapshots de un sitio' })
  @ApiParam({ name: 'siteId', description: 'ID del sitio a consultar' })
  @ApiResponse({ status: 200, description: 'Historial de snapshots', type: [SnapshotResponseDto] })
  async findAllBySite(
    @CurrentUser() userId: Types.ObjectId,
    @Param('siteId') siteId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.snapshotService.findAllBySite(userId, siteId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle y métricas de un snapshot por ID' })
  @ApiParam({ name: 'id', description: 'ID del snapshot' })
  @ApiResponse({ status: 200, description: 'Detalle del snapshot', type: SnapshotResponseDto })
  async findOne(@CurrentUser() userId: Types.ObjectId, @Param('id') id: string) {
    return this.snapshotService.findOne(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar un snapshot que se encuentre en ejecución o pendiente' })
  @ApiParam({ name: 'id', description: 'ID del snapshot a cancelar' })
  async cancel(@CurrentUser() userId: Types.ObjectId, @Param('id') id: string) {
    return this.snapshotService.cancel(userId, id);
  }
}
