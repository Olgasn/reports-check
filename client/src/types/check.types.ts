export interface CheckResult {
  grade: number;
  review: string;
  advantages: string[];
  disadvantages: string[];
  student: string;
  num: string;
}

export interface CheckData {
  reportsZip: File;
  task: File;
  modelId: number;
}
