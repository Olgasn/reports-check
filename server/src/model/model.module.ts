import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { KeyModule } from 'src/key/key.module';

@Module({
  controllers: [ModelController],
  providers: [ModelService],
  imports: [KeyModule],
  exports: [ModelService],
})
export class ModelModule {}
