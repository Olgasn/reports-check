import { Module } from '@nestjs/common';
import { FileModule } from 'src/file/file.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LlmModule } from 'src/llm/llm.module';
import { ModelModule } from 'src/model/model.module';

@Module({
  imports: [FileModule, LlmModule, ModelModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
