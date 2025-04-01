import { Module } from '@nestjs/common';
import { KeyModule } from './key/key.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from './typeorm/typeorm.module';
import { config } from './config/config';
import { ModelModule } from './model/model.module';
import { FileModule } from './file/file.module';
import { ReportsModule } from './reports/reports.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeormModule,
    KeyModule,
    ModelModule,
    FileModule,
    ReportsModule,
    LlmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
