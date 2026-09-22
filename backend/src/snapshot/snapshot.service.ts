import { Injectable } from '@nestjs/common';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { UpdateSnapshotDto } from './dto/update-snapshot.dto';

@Injectable()
export class SnapshotService {
  create(createSnapshotDto: CreateSnapshotDto) {
    return 'This action adds a new snapshot';
  }

  findAll() {
    return `This action returns all snapshot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} snapshot`;
  }

  update(id: number, updateSnapshotDto: UpdateSnapshotDto) {
    return `This action updates a #${id} snapshot`;
  }

  remove(id: number) {
    return `This action removes a #${id} snapshot`;
  }
}
