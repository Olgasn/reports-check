export interface IReport {
  student: string;
  model: string;
  status: 'checked' | 'started' | 'failed';
  id: number;
  labId: number;
}

export interface INotification {
  time: number;
  ids: number[];
  text: string;
  labId: number;
}

export type CheckStatusType = 'checked' | 'failed' | 'pending' | 'started';
