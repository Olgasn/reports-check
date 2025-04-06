export interface ICourse {
  id: number;
  name: string;
  description: string;
}

export interface ICreateCourse {
  name: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IEditCourse extends ICreateCourse {}
