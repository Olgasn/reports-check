import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type, plainToInstance } from 'class-transformer';

import { PaginationDto } from './pagination.dto';

type ClassConstructor<T> = new (...args: any[]) => T;

export class PaginatedDto<T, K> {
  @ApiProperty({ type: () => [Object] })
  @Type(() => Object)
  @Expose()
  items: T[];

  @ApiProperty()
  @Expose()
  nextPage?: number;

  @ApiProperty()
  @Expose()
  prevPage?: number;

  @ApiProperty()
  @Expose()
  total: number;

  constructor(dto: ClassConstructor<T>, items: K[], count: number, paginationDto: PaginationDto) {
    this.items = items.map((item) => plainToInstance(dto, item, { excludeExtraneousValues: true }));
    this.total = Math.ceil(count / paginationDto.pageSize);

    const { offset, page, pageSize } = paginationDto;

    if (count > 0 && count - page * pageSize > 0) {
      this.nextPage = page + 1;
    }

    if (count - offset > 0 && page - 1 > 0) {
      this.prevPage = page - 1;
    }
  }
}
