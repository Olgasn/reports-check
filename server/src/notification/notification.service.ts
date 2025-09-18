import { Injectable } from '@nestjs/common';
import { WsGateway } from 'src/ws/ws.gateway';
import { EVENTS } from './notification.constants';
import { IReportOneStart } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(private readonly wsGateway: WsGateway) {}

  reportOneChecked(payload: IReportOneStart) {
    this.wsGateway.sendToUser(EVENTS.REPORT_ONE_SUCCESS, { ...payload, status: 'checked' });
  }

  reportOneStarted(payload: IReportOneStart) {
    this.wsGateway.sendToUser(EVENTS.REPORT_ONE_STARTED, { ...payload, status: 'started' });
  }

  reportOneFailed(payload: IReportOneStart) {
    this.wsGateway.sendToUser(EVENTS.REPORT_ONE_FAILED, { ...payload, status: 'failed' });
  }

  reportsChecked(ids: number[], labId: number) {
    this.wsGateway.sendToUser(EVENTS.REPORTS_CHECKED, { ids, labId });
  }

  checkStarted() {
    this.wsGateway.sendToUser(EVENTS.CHECK_STARTED);
  }

  checkFailed(labId: number, reason: string = 'Неизвестная ошибка') {
    this.wsGateway.sendToUser(EVENTS.CHECK_FAILED, { labId, reason });
  }
}
