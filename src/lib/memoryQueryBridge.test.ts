import { describe, expect, test } from 'vitest';
import { buildMemoryRetrievalQuery } from './memoryQueryBridge';

describe('buildMemoryRetrievalQuery', () => {
  test('expands Korean feature-addition intent into memory retrieval terms', () => {
    const query = buildMemoryRetrievalQuery({
      question: '이번에도 기능을 더 넣어야 할까?',
    });

    expect(query.originalQuery).toBe('이번에도 기능을 더 넣어야 할까?');
    expect(query.expansions).toEqual(
      expect.arrayContaining([
        'feature addition',
        'scope expansion',
        'launch',
        'anxiety',
        'delay',
        'freeze',
      ]),
    );
    expect(query.expandedQuery).toContain('이번에도 기능을 더 넣어야 할까?');
    expect(query.expandedQuery).toContain('feature addition');
    expect(query.expandedQuery).toContain('scope expansion');
  });

  test('includes current decision context and dedupes expansion terms deterministically', () => {
    const query = buildMemoryRetrievalQuery({
      question: '이번에도 기능을 더 넣어야 할까?',
      currentDecision: {
        id: 'decision-query-bridge',
        prompt: 'MVP에 기능을 더 넣을지, 지금 배포할지',
        emotions: ['anxiety', 'anxiety'],
        choices: ['add features', 'freeze'],
        topicTags: ['launch', 'feature addition', 'launch'],
      },
    });

    expect(query.sourceTerms).toEqual(
      expect.arrayContaining([
        'MVP에 기능을 더 넣을지, 지금 배포할지',
        'anxiety',
        'add features',
        'freeze',
        'launch',
        'feature addition',
      ]),
    );
    expect(query.expansions.filter((term) => term === 'feature addition')).toHaveLength(1);
    expect(query.expansions.filter((term) => term === 'launch')).toHaveLength(1);
    expect(query.expandedQuery).toContain('add features');
    expect(query.expandedQuery).toContain('freeze');
  });
});
