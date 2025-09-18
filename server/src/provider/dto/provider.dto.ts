import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProviderDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  url: string;
}
