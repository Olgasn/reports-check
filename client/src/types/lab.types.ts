export interface ILab {
  id: number;
  name: string;
  description: string;
  filename: string;
  filesize: number;
  content: string;
}

export interface ICreateLab {
  name: string;
  description: string;
  courseId: number;
  task: File;
}

export type IEditLab = Partial<ICreateLab>;
