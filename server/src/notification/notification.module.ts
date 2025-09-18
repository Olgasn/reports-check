import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WsModule } from 'src/ws/ws.module';

@Module({
  imports: [WsModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
