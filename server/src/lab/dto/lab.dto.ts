import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CourseDto } from 'src/course/dto/course.dto';

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

  @ApiProperty()
  @Expose()
  filename: string;

  @ApiProperty()
  @Expose()
  filesize: number;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Type(() => CourseDto)
  @Expose()
  course: CourseDto;
}
