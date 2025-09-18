import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class SerializeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const dtoClass = this.reflector.get('dto', handler);

    return next.handle().pipe(
      map((data) => {
        if (!dtoClass) {
          return data;
        }

        if (Array.isArray(data)) {
          const result = data.map((item) =>
            plainToInstance(dtoClass, item, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
              enableCircularCheck: true,
            }),
          );

          return result;
        }

        const dto = plainToInstance(dtoClass, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
          enableCircularCheck: true,
        });

        return dto;
      }),
    );
  }
}
