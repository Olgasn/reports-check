import { ApiProperty } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Course } from '../entities/course.entity';
import { CourseDto } from './course.dto';

export class CoursePaginatedDto extends PaginatedDto<CourseDto, Course> {
  @ApiProperty({ type: () => [CourseDto] })
  @Type(() => CourseDto)
  @Expose()
  declare items: CourseDto[];

  constructor(items: Course[], count: number, paginationDto: PaginationDto) {
    super(CourseDto, items, count, paginationDto);
  }
}
