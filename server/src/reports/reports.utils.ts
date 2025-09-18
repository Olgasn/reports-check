interface IStudent {
  name: string;
  surname: string;
  middlename: string;
}

export const isSimilarStudents = (st1: IStudent, st2: IStudent) => {
  return st1.name === st2.name && st1.surname === st2.surname && st1.middlename === st2.middlename;
};
