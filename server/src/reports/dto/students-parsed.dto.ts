import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class StudentParsedDto {
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsString()
  @Expose()
  surname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  middlename: string;

  @ApiProperty()
  @IsString()
  @Expose()
  id: string;
}

export class StudentsParsedDto {
  @ApiProperty()
  @Type(() => StudentParsedDto)
  @Expose()
  students: StudentParsedDto[];
}

export class StudentParseDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  reportsZip: Express.Multer.File;
}
