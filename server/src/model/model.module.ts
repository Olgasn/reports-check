import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { KeyModule } from 'src/key/key.module';
import { ProviderModule } from 'src/provider/provider.module';
import { OllamaHandler } from './providers/handlers/ollama.handler';
import { OpenAiHandler } from './providers/handlers/openai.handler';
import { ModelFabric } from './providers/model.fabric';

@Module({
  controllers: [ModelController],
  providers: [ModelService, OllamaHandler, OpenAiHandler, ModelFabric],
  imports: [KeyModule, ProviderModule],
  exports: [ModelService],
})
export class ModelModule {}
