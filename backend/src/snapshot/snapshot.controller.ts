import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { DeleteResponseDto } from '../shared/dto/delete-response.dto';
import { ParseObjectIdPipe } from '../shared/pipes/parse-object-id.pipe';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { SnapshotResponseDto } from './dto/snapshot-response.dto';
import { SnapshotService } from './snapshot.service';

@ApiTags('snapshots')
@Controller('snapshots')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post()
  @ApiOperation({
    summary: 'Disparar un nuevo snapshot para un sitio (sólo permitido si no hay otro activo)',
  })
  @ApiResponse({
    status: 201,
    description: 'Snapshot iniciado exitosamente',
    type: SnapshotResponseDto,
  })
  async create(
    @CurrentUser() userId: Types.ObjectId,
    @Body() createSnapshotDto: CreateSnapshotDto,
  ) {
    return this.snapshotService.create(userId, createSnapshotDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle y métricas de un snapshot por ID' })
  @ApiParam({ name: 'id', description: 'ID del snapshot (ObjectId)' })
  @ApiResponse({ status: 200, description: 'Detalle del snapshot', type: SnapshotResponseDto })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  async findOne(
    @CurrentUser() userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.snapshotService.findOne(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar un snapshot que se encuentre en ejecución o pendiente' })
  @ApiParam({ name: 'id', description: 'ID del snapshot a cancelar (ObjectId)' })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  async cancel(
    @CurrentUser() userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.snapshotService.cancel(userId, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar definitivamente un snapshot y todos sus documentos y logs asociados',
  })
  @ApiParam({ name: 'id', description: 'ID del snapshot a eliminar (ObjectId)' })
  @ApiResponse({
    status: 200,
    description: 'Snapshot y sus datos eliminados exitosamente',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  async remove(
    @CurrentUser() userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.snapshotService.remove(userId, id);
  }
}
