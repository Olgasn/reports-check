import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  surname: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  middlename: string;

  @ApiProperty()
  @Optional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  groupId?: number;
}
