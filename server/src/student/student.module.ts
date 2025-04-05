import { forwardRef, Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { GroupModule } from 'src/group/group.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [forwardRef(() => GroupModule)],
  exports: [StudentService],
})
export class StudentModule {}
