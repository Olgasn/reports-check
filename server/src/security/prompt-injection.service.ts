import { Injectable } from '@nestjs/common';

export type PromptInjectionRiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface PromptInjectionAnalysis {
  detected: boolean;
  riskLevel: PromptInjectionRiskLevel;
  indicators: string[];
  fragments: string[];
}

export interface PromptInjectionResultFields {
  promptInjectionDetected?: boolean;
  promptInjectionRisk?: PromptInjectionRiskLevel;
  promptInjectionFragments?: string[];
  securityComment?: string;
}

interface InjectionPattern {
  indicator: string;
  regex: RegExp;
  riskLevel: Exclude<PromptInjectionRiskLevel, 'none'>;
}

const RISK_ORDER: Record<PromptInjectionRiskLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

@Injectable()
export class PromptInjectionService {
  private readonly patterns: InjectionPattern[] = [
    {
      indicator: 'ignore-previous-instructions',
      regex: /(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+instructions/i,
      riskLevel: 'high',
    },
    {
      indicator: 'change-assistant-role',
      regex: /(you are now|act as|developer message|system prompt|system message)/i,
      riskLevel: 'high',
    },
    {
      indicator: 'force-positive-grade',
      regex: /(поставь|выставь|дай|верни)\s+(10|десять|максимальн|положительн|отличн)/i,
      riskLevel: 'high',
    },
    {
      indicator: 'skip-check',
      regex: /(не\s+проверяй|пропусти\s+проверку|skip\s+(the\s+)?check|do\s+not\s+check)/i,
      riskLevel: 'high',
    },
    {
      indicator: 'force-output',
      regex: /(верни\s+только|return\s+only|respond\s+only|напиши\s+только)/i,
      riskLevel: 'medium',
    },
    {
      indicator: 'hide-errors',
      regex: /(скрой\s+ошибк|не\s+указывай\s+ошибк|hide\s+errors|do\s+not\s+mention\s+errors)/i,
      riskLevel: 'high',
    },
    {
      indicator: 'structured-output-tampering',
      regex: /<\/?JSON>|@SPLIT|<\/?UNTRUSTED_[A-Z_]+>/i,
      riskLevel: 'medium',
    },
  ];

  analyze(text: string): PromptInjectionAnalysis {
    if (!text?.trim()) {
      return this.emptyAnalysis();
    }

    const indicators: string[] = [];
    const fragments: string[] = [];
    let riskLevel: PromptInjectionRiskLevel = 'none';

    for (const pattern of this.patterns) {
      const match = text.match(pattern.regex);

      if (!match || match.index === undefined) {
        continue;
      }

      indicators.push(pattern.indicator);
      fragments.push(this.extractFragment(text, match.index, match[0].length));
      riskLevel = this.maxRisk(riskLevel, pattern.riskLevel);
    }

    return {
      detected: indicators.length > 0,
      riskLevel,
      indicators: this.unique(indicators),
      fragments: this.unique(fragments),
    };
  }

  mergeResultFields<T extends PromptInjectionResultFields>(
    result: T,
    analysis: PromptInjectionAnalysis,
  ): T & Required<PromptInjectionResultFields> {
    const detected = Boolean(result.promptInjectionDetected) || analysis.detected;
    const promptInjectionRisk = this.maxRisk(
      result.promptInjectionRisk ?? 'none',
      analysis.riskLevel,
    );
    const promptInjectionFragments = this.unique([
      ...(result.promptInjectionFragments ?? []),
      ...analysis.fragments,
    ]);
    const securityComment =
      result.securityComment ??
      (detected ? 'Potential prompt injection was detected in untrusted report content.' : '');

    return {
      ...result,
      promptInjectionDetected: detected,
      promptInjectionRisk,
      promptInjectionFragments,
      securityComment,
    };
  }

  assertGeneratedReviewAllowed(result: {
    review?: string;
    advantages?: string[];
    disadvantages?: string[];
  }) {
    const text = [
      result.review ?? '',
      ...(result.advantages ?? []),
      ...(result.disadvantages ?? []),
    ]
      .join('\n')
      .toLowerCase();

    const forbiddenMarkers = [
      'проверка пропущена',
      'пропускаю проверку',
      'по просьбе студента',
      'ставлю 10 по просьбе',
      'skip the check',
      'as requested by the student',
      'give full credit',
    ];

    if (forbiddenMarkers.some((marker) => text.includes(marker))) {
      throw new Error('Model response appears to follow a prompt injection instruction');
    }
  }

  formatSecurityContext(analysis: PromptInjectionAnalysis) {
    return JSON.stringify(
      {
        promptInjectionDetected: analysis.detected,
        promptInjectionRisk: analysis.riskLevel,
        indicators: analysis.indicators,
        suspiciousFragments: analysis.fragments,
      },
      null,
      2,
    );
  }

  private emptyAnalysis(): PromptInjectionAnalysis {
    return {
      detected: false,
      riskLevel: 'none',
      indicators: [],
      fragments: [],
    };
  }

  private maxRisk(
    current: PromptInjectionRiskLevel,
    next: PromptInjectionRiskLevel,
  ): PromptInjectionRiskLevel {
    return RISK_ORDER[next] > RISK_ORDER[current] ? next : current;
  }

  private extractFragment(text: string, index: number, length: number) {
    const padding = 80;
    const start = Math.max(0, index - padding);
    const end = Math.min(text.length, index + length + padding);

    return text.slice(start, end).replace(/\s+/g, ' ').trim();
  }

  private unique(items: string[]) {
    return [...new Set(items.filter(Boolean))];
  }
}
