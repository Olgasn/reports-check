import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class CheckReportDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  reportsZip: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  task: Express.Multer.File;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  modelId: number;
}
