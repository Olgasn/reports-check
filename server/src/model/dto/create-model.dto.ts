import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateModelDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  value: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  keyId: number;
}
