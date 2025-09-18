import { Module } from '@nestjs/common';
import { CheckService } from './check.service';
import { LabModule } from 'src/lab/lab.module';
import { StudentModule } from 'src/student/student.module';
import { ModelModule } from 'src/model/model.module';

@Module({
  controllers: [],
  providers: [CheckService],
  exports: [CheckService],
  imports: [LabModule, StudentModule, ModelModule],
})
export class CheckModule {}
