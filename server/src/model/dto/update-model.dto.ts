import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateModelDto } from './create-model.dto';
import { IsEnum } from 'class-validator';
import { LlmInterfaces } from 'src/types/reports.types';

export class UpdateModelDto extends PartialType(OmitType(CreateModelDto, ['llmInterface'])) {
  @ApiProperty({
    enum: LlmInterfaces,
    example: LlmInterfaces.OpenAi,
  })
  @IsEnum(LlmInterfaces)
  llmInterface: LlmInterfaces;
}
