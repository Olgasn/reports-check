import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { LlmInterfaces } from 'src/types/reports.types';

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
  top_p?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  temperature?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  max_tokens?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  keyId?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  providerId?: number;

  @ApiProperty({
    enum: LlmInterfaces,
    example: LlmInterfaces.OpenAi,
  })
  @IsEnum(LlmInterfaces)
  llmInterface: LlmInterfaces;
}
