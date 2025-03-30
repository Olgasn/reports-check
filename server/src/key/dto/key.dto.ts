import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class KeyDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  value: string;
}
