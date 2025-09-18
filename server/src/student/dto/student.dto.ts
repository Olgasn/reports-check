import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GroupDto } from 'src/group/dto/group.dto';

export class StudentDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  surname: string;

  @ApiProperty()
  @Expose()
  middlename: string;

  @ApiProperty()
  @Type(() => GroupDto)
  @Expose()
  group: GroupDto | null;
}
