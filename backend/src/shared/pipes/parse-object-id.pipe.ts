import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Pipe de transformación que valida que el valor recibido sea un ObjectId de MongoDB válido
 * y lo convierte directamente a Types.ObjectId.
 *
 * Uso en controller:
 *   @Param('id', ParseObjectIdPipe) id: Types.ObjectId
 *
 * Si el valor es inválido lanza BadRequestException (400) antes de llegar al servicio,
 * evitando que un ID malformado provoque un error 500 interno.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`'${value}' no es un ObjectId válido`);
    }
    return new Types.ObjectId(value);
  }
}
