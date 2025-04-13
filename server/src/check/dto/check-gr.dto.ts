import { StudentDto } from 'src/student/dto/student.dto';
import { GroupDto } from 'src/group/dto/group.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StudentCheckDto extends OmitType(StudentDto, ['group']) {}

export class CheckItemDto {
  @ApiProperty()
  @Expose()
  grade: number;

  @ApiProperty()
  @Expose()
  advantages: string;

  @ApiProperty()
  @Expose()
  disadvantages: string;

  @ApiProperty()
  @Expose()
  review: string;

  @ApiProperty()
  @Expose()
  date: Date;
}

export class GroupCheckDto {
  @ApiProperty()
  @Type(() => StudentCheckDto)
  @Expose()
  student: StudentCheckDto;

  @ApiProperty({ type: [CheckItemDto] })
  @Type(() => CheckItemDto)
  @Expose()
  checks: CheckItemDto[];
}

export class CheckGrDto {
  @ApiProperty({ type: GroupDto })
  @Type(() => GroupDto)
  @Expose()
  group: GroupDto;

  @ApiProperty({ type: [GroupCheckDto] })
  @Type(() => GroupCheckDto)
  @Expose()
  results: GroupCheckDto[];
}
