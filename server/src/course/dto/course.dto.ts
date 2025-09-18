import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PromptDto } from 'src/prompt/dto/prompt.dto';

export class CourseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Type(() => PromptDto)
  @Expose()
  prompt: PromptDto | null;
}
