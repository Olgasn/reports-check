import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PromptDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  content: string;
}
