import type { CurrentDecision } from './decisionReplay';

export interface BuildMemoryRetrievalQueryInput {
  question: string;
  currentDecision?: CurrentDecision;
  followUpContext?: {
    previousQuestion?: string;
    previousRecommendation?: string;
  };
}

export interface MemoryRetrievalQuery {
  originalQuery: string;
  expandedQuery: string;
  expansions: string[];
  sourceTerms: string[];
}

function appendUnique(target: string[], values: readonly string[]): void {
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    if (target.some((existing) => existing.toLocaleLowerCase() === normalized.toLocaleLowerCase())) continue;
    target.push(normalized);
  }
}

function sourceTermsForInput(input: BuildMemoryRetrievalQueryInput): string[] {
  const sourceTerms: string[] = [];
  appendUnique(sourceTerms, [input.question]);
  if (input.currentDecision) {
    appendUnique(sourceTerms, [input.currentDecision.prompt]);
    appendUnique(sourceTerms, input.currentDecision.emotions);
    appendUnique(sourceTerms, input.currentDecision.choices);
    appendUnique(sourceTerms, input.currentDecision.topicTags);
  }
  if (input.followUpContext) {
    appendUnique(sourceTerms, [input.followUpContext.previousQuestion ?? '']);
    appendUnique(sourceTerms, [input.followUpContext.previousRecommendation ?? '']);
  }
  return sourceTerms;
}

function expansionsForSourceText(sourceText: string): string[] {
  const expansions: string[] = [];
  const normalized = sourceText.toLocaleLowerCase();

  if (/기능|feature|add feature|add features|더\s*넣|추가/.test(normalized)) {
    appendUnique(expansions, ['feature addition', 'scope expansion', 'launch', 'anxiety', 'delay', 'freeze']);
  }
  if (/배포|출시|런칭|launch|ship|shipping/.test(normalized)) {
    appendUnique(expansions, ['launch', 'shipping', 'release', 'delay']);
  }
  if (/불안|걱정|고민|anxiety|pressure/.test(normalized)) {
    appendUnique(expansions, ['anxiety', 'pressure', 'avoidance']);
  }
  if (/미루|지연|delay|delayed|postpone|postponed/.test(normalized)) {
    appendUnique(expansions, ['delay', 'delayed', 'postponed', 'launch delay']);
  }
  if (/멈추|동결|프리즈|freeze|cut|scope/.test(normalized)) {
    appendUnique(expansions, ['freeze', 'cut scope', 'scope expansion']);
  }

  return expansions;
}

export function buildMemoryRetrievalQuery(input: BuildMemoryRetrievalQueryInput): MemoryRetrievalQuery {
  const sourceTerms = sourceTermsForInput(input);
  const expansions = expansionsForSourceText(sourceTerms.join(' '));
  const expandedQuery = [...sourceTerms, ...expansions].join(' ');

  return {
    originalQuery: input.question,
    expandedQuery,
    expansions,
    sourceTerms,
  };
}
