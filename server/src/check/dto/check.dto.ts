import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { LabDto } from 'src/lab/dto/lab.dto';
import { ModelDto } from 'src/model/dto/model.dto';
import { StudentDto } from 'src/student/dto/student.dto';

export class CheckDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  advantages: string;

  @ApiProperty()
  @Expose()
  disadvantages: string;

  @ApiProperty()
  @Expose()
  grade: number;

  @ApiProperty()
  @Expose()
  review: string;

  @ApiProperty()
  @Expose()
  report: string;

  @ApiProperty()
  @Type(() => LabDto)
  @Expose()
  lab: LabDto;

  @ApiProperty()
  @Type(() => ModelDto)
  @Expose()
  model: ModelDto;

  @ApiProperty()
  @Type(() => StudentDto)
  @Expose()
  student: StudentDto;

  @ApiProperty()
  @Expose()
  date: string;
}
