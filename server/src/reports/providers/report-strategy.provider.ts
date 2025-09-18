import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MultipleModelStrategy } from '../strategies/multiple-model.strategy';
import { OneModelStrategy } from '../strategies/one-model.strategy';

@Injectable()
export class ReportStrategy {
  constructor(private readonly moduleRef: ModuleRef) {}

  getStrategy(modelsAmount: number) {
    if (modelsAmount >= 2) {
      return this.moduleRef.get(MultipleModelStrategy);
    }

    return this.moduleRef.get(OneModelStrategy);
  }
}
