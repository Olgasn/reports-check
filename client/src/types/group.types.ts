export interface IGroup {
  id: number;
  name: string;
}

export interface ICreateGroup {
  name: string;
}

export type IUpdateGroup = ICreateGroup;
