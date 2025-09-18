import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetChecksDto {
  @ApiProperty({ type: [Number] })
  @IsNumber({}, { each: true })
  ids: number[];
}
