import { describe, expect, it } from 'vitest';
import { pickSuggestion, scoreCandidate } from '../src/suggestion';
import type { DbParticipant } from '../src/types';

function person(id: string, jobProfile: string): DbParticipant {
  return { id, name: id, photo_path: null, job_profile: jobProfile, title: null };
}

describe('scoreCandidate', () => {
  it('scores an unrated candidate higher than a fully-known one', () => {
    const unrated = scoreCandidate('Design', 'Design', null);
    const knownWell = scoreCandidate('Design', 'Design', 3);
    expect(unrated).toBeGreaterThan(knownWell);
  });

  it('adds a bonus for a different job profile', () => {
    const sameProfile = scoreCandidate('Design', 'Design', 1);
    const differentProfile = scoreCandidate('Design', 'Product', 1);
    expect(differentProfile).toBeGreaterThan(sameProfile);
  });
});

describe('pickSuggestion', () => {
  const viewer = person('p1', 'Design');
  const all = [viewer, person('p2', 'Product'), person('p3', 'Design')];

  it('excludes the viewer from candidates', () => {
    const result = pickSuggestion(viewer, all, new Map(), []);
    expect(result?.id).not.toBe('p1');
  });

  it('prefers an unrated candidate over a rated one', () => {
    const ratings = new Map([['p3', 3]]);
    const result = pickSuggestion(viewer, all, ratings, []);
    expect(result?.id).toBe('p2');
  });

  it('respects the exclude list', () => {
    const result = pickSuggestion(viewer, all, new Map(), ['p2']);
    expect(result?.id).toBe('p3');
  });

  it('returns null when every candidate is excluded', () => {
    const result = pickSuggestion(viewer, all, new Map(), ['p2', 'p3']);
    expect(result).toBeNull();
  });
});
