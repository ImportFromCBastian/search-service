import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { UpdateSnapshotDto } from './dto/update-snapshot.dto';
import { SnapshotService } from './snapshot.service';

@Controller('snapshot')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post()
  create(@Body() createSnapshotDto: CreateSnapshotDto) {
    return this.snapshotService.create(createSnapshotDto);
  }

  @Get()
  findAll() {
    return this.snapshotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.snapshotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSnapshotDto: UpdateSnapshotDto) {
    return this.snapshotService.update(+id, updateSnapshotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.snapshotService.remove(+id);
  }
}
