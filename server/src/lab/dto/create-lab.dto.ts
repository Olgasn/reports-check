import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLabDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  task: Express.Multer.File;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  courseId: number;
}
