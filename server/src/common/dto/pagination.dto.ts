import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsPositive, IsInt, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  get offset() {
    return (this.page - 1) * this.pageSize;
  }
}
