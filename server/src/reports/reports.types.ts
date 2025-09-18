import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { CheckResult, ReportCheck } from 'src/types/reports.types';
import { ReportCheck as ReportCheckType } from 'src/types/reports.types';

export interface CheckOneReportDto {
  report: ReportCheck;
  task: string;
  content: string;
  model: Model;
  groupId: number;
  checkPrev: boolean;
  labId: number;
}

export interface ProcessStudentDto {
  name: string;
  surname: string;
  middlename: string;
  groupId: number;
}

export interface FilterSuccessResultsDto {
  resultPromises: PromiseSettledResult<CheckResult>[];
  reportsData: ReportCheckType[];
  modelName: string;
  labId: number;
}

export interface MultipleReviewDto {
  student: Student;
  result: string[];
  answer: string;
}

export interface CombineCheckResultsDto {
  reviewData: MultipleReviewDto[];
  modelReview: Model;
  task: string;
  content: string;
}

export interface CombineCheckResultDto {
  modelReview: Model;
  task: string;
  content: string;
  data: MultipleReviewDto;
}
