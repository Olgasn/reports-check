import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { KeyDto } from 'src/key/dto/key.dto';
import { Providers } from 'src/types/reports.types';

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

  @ApiProperty()
  @Expose()
  provider: Providers;

  @ApiProperty()
  @Expose()
  top_p: number;

  @ApiProperty()
  @Expose()
  temperature: number;

  @ApiProperty()
  @Expose()
  max_tokens: number;
}
