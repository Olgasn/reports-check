import { Module } from '@nestjs/common';
import { FileModule } from 'src/file/file.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [FileModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
