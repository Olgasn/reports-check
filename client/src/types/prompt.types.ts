export interface IPrompt {
  id: number;
  content: string;
}

export interface ICreatePrompt {
  content: string;
  courseId: number;
}

export type IEditPrompt = Partial<ICreatePrompt>;
