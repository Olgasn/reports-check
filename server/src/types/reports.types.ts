import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { PromptInjectionRiskLevel } from 'src/security/prompt-injection.service';

export interface ReportCheck {
  name: string;
  surname: string;
  middlename: string;
  num: string;
  content: string;
}

export enum LlmInterfaces {
  Ollama = 'Ollama',
  OpenAi = 'OpenAi',
}

export interface CheckResult {
  student: Student;
  grade: number;
  advantages: string[];
  disadvantages: string[];
  review: string;
  promptInjectionDetected: boolean;
  promptInjectionRisk: PromptInjectionRiskLevel;
  promptInjectionFragments: string[];
  securityComment: string;
  model: Model;
  answer: string;
}
