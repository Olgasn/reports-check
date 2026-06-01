import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PromptInjectionRiskLevel } from 'src/security/prompt-injection.service';

const PROMPT_INJECTION_RISK_LEVELS: PromptInjectionRiskLevel[] = ['none', 'low', 'medium', 'high'];

export class CheckResultDto {
  @ApiProperty()
  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  grade: number;

  @ApiProperty()
  @Expose()
  @IsString()
  @MaxLength(5000)
  review: string;

  @ApiProperty()
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  advantages: string[];

  @ApiProperty()
  @Expose()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  disadvantages: string[];

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsBoolean()
  promptInjectionDetected = false;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsIn(PROMPT_INJECTION_RISK_LEVELS)
  promptInjectionRisk: PromptInjectionRiskLevel = 'none';

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  promptInjectionFragments: string[] = [];

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  securityComment = '';

  @ApiProperty()
  @Expose()
  student: string;

  @ApiProperty()
  @Expose()
  num: string;
}
