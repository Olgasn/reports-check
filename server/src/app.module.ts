import { Module } from '@nestjs/common';
import { KeyModule } from './key/key.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from './typeorm/typeorm.module';
import { config } from './config/config';
import { ModelModule } from './model/model.module';
import { FileModule } from './file/file.module';
import { ReportsModule } from './reports/reports.module';
import { LlmModule } from './llm/llm.module';
import { StudentModule } from './student/student.module';
import { GroupModule } from './group/group.module';
import { CourseModule } from './course/course.module';
import { LabModule } from './lab/lab.module';
import { PromptModule } from './prompt/prompt.module';

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
    StudentModule,
    GroupModule,
    CourseModule,
    LabModule,
    PromptModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
