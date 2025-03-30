import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { KeyDto } from 'src/key/dto/key.dto';

export class ModelDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  value: string;

  @ApiProperty()
  @Type(() => KeyDto)
  @Expose()
  key: KeyDto;
}
