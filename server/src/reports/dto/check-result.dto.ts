import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class CheckResultDto {
  @ApiProperty()
  @Expose()
  @Type(() => Number)
  @IsNumber()
  grade: number;

  @ApiProperty()
  @Expose()
  @IsString()
  review: string;

  @ApiProperty()
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  advantages: string[];

  @ApiProperty()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  disadvantages: string[];

  @ApiProperty()
  @Expose()
  student: string;

  @ApiProperty()
  @Expose()
  num: string;
}
