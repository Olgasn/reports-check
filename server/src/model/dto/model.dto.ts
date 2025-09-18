import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { KeyDto } from 'src/key/dto/key.dto';
import { ProviderDto } from 'src/provider/dto/provider.dto';
import { LlmInterfaces } from 'src/types/reports.types';

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
  key: KeyDto | null;

  @ApiProperty()
  @Type(() => ProviderDto)
  @Expose()
  provider: ProviderDto | null;

  @ApiProperty()
  @Expose()
  llmInterface: LlmInterfaces;

  @ApiProperty()
  @Expose()
  top_p: number;

  @ApiProperty()
  @Expose()
  temperature: number;

  @ApiProperty()
  @Expose()
  max_tokens: number;

  @ApiProperty()
  @Expose()
  maxRetries: number;

  @ApiProperty()
  @Expose()
  queryDelay: number;

  @ApiProperty()
  @Expose()
  errorDelay: number;
}
