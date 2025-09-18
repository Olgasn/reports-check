import { Module } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { CourseModule } from 'src/course/course.module';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [LabController],
  providers: [LabService],
  imports: [CourseModule, FileModule],
  exports: [LabService],
})
export class LabModule {}
