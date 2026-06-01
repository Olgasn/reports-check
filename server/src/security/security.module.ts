import { Module } from '@nestjs/common';
import { PromptInjectionService } from './prompt-injection.service';

@Module({
  providers: [PromptInjectionService],
  exports: [PromptInjectionService],
})
export class SecurityModule {}
