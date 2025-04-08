import { Module } from '@nestjs/common';
import { FileModule } from 'src/file/file.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LlmModule } from 'src/llm/llm.module';
import { ModelModule } from 'src/model/model.module';
import { StudentModule } from 'src/student/student.module';
import { LabModule } from 'src/lab/lab.module';
import { CheckModule } from 'src/check/check.module';
import { PromptModule } from 'src/prompt/prompt.module';

@Module({
  imports: [
    FileModule,
    LlmModule,
    ModelModule,
    StudentModule,
    LabModule,
    CheckModule,
    PromptModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
