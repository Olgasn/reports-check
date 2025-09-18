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
import { GroupModule } from 'src/group/group.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ReportCheck } from './providers/report-check.provider';
import { OneModelStrategy } from './strategies/one-model.strategy';
import { MultipleModelStrategy } from './strategies/multiple-model.strategy';
import { ReportStrategy } from './providers/report-strategy.provider';

@Module({
  imports: [
    FileModule,
    LlmModule,
    ModelModule,
    StudentModule,
    LabModule,
    CheckModule,
    PromptModule,
    GroupModule,
    NotificationModule,
  ],
  providers: [ReportsService, ReportCheck, OneModelStrategy, MultipleModelStrategy, ReportStrategy],
  controllers: [ReportsController],
})
export class ReportsModule {}
