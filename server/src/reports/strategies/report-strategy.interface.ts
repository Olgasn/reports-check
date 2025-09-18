import { Check } from 'src/check/entities/check.entity';
import { CheckReportDto } from '../dto/check-report.dto';

export interface ReportStrategy {
  check(dto: CheckReportDto): Promise<Check[]>;
}
