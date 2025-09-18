export interface CheckNotificationProps {
  student: string;
  model: string;
  status: 'checked' | 'started' | 'failed';
}
