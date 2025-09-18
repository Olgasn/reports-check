import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { StudentParsedDto } from './students-parsed.dto';

export class CheckReportDto {
  @ApiProperty({
    type: [Number],
  })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  modelsId: number[];

  @ApiProperty({ type: [StudentParsedDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentParsedDto)
  studentsId: StudentParsedDto[] = [];

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  reportsZip: Express.Multer.File;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  labId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  groupId: number;

  @ApiProperty()
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  checkPrev: boolean;
}
