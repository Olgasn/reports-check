import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Student } from '../entities/student.entity';
import { StudentDto } from './student.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';
import { PaginatedDto } from 'src/common/dto/paginated.dto';

export class StudentsPaginatedDto extends PaginatedDto<StudentDto, Student> {
  @ApiProperty({ type: () => [StudentDto] })
  @Type(() => StudentDto)
  @Expose()
  declare items: StudentDto[];

  constructor(items: Student[], count: number, paginationDto: PaginationDto) {
    super(StudentDto, items, count, paginationDto);
  }
}
