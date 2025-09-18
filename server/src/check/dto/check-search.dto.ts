import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { endOfMonth, startOfMonth } from 'date-fns';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CheckSearchDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  studentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  groupId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate: Date = startOfMonth(new Date());

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date = endOfMonth(new Date());
}
