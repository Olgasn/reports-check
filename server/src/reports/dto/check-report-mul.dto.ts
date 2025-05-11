import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CheckReportMulDto {
  @ApiProperty({
    type: [Number],
  })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  modelsId: number[];

  @ApiProperty({
    type: [Number],
  })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  studentsId: number[] = [];

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
