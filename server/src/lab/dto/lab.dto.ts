import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LabDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;
}
