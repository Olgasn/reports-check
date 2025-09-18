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
import { CheckModule } from './check/check.module';
import { MulterModule } from '@nestjs/platform-express';
import { WsModule } from './ws/ws.module';
import { ProviderModule } from './provider/provider.module';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    MulterModule.register({
      fileFilter: (_, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
      },
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
    CheckModule,
    WsModule,
    ProviderModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [NotificationService],
})
export class AppModule {}
