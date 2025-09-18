import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { StudentModule } from 'src/student/student.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
  imports: [forwardRef(() => StudentModule)],
})
export class GroupModule {}
