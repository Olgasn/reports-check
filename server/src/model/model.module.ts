import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { KeyModule } from 'src/key/key.module';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  controllers: [ModelController],
  providers: [ModelService],
  imports: [KeyModule, ProviderModule],
  exports: [ModelService],
})
export class ModelModule {}
