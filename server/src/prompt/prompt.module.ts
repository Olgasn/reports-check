import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { CourseModule } from 'src/course/course.module';

@Module({
  controllers: [PromptController],
  providers: [PromptService],
  imports: [CourseModule],
  exports: [PromptService],
})
export class PromptModule {}
