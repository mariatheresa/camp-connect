import type { DbParticipant } from './types';

const UNRATED_BONUS = 10;
const DIFFERENT_JOB_BONUS = 2;

export function scoreCandidate(
  viewerJobProfile: string | null,
  candidateJobProfile: string | null,
  level: number | null,
): number {
  const familiarityScore = level === null ? UNRATED_BONUS : 3 - level;
  const diversityBonus =
    viewerJobProfile && candidateJobProfile && viewerJobProfile !== candidateJobProfile
      ? DIFFERENT_JOB_BONUS
      : 0;
  return familiarityScore + diversityBonus;
}

export function pickSuggestion(
  viewer: DbParticipant,
  allParticipants: DbParticipant[],
  ratingsGiven: Map<string, number>,
  excludeIds: string[],
): DbParticipant | null {
  const excludeSet = new Set([viewer.id, ...excludeIds]);
  const candidates = allParticipants.filter((p) => !excludeSet.has(p.id));
  if (candidates.length === 0) return null;

  let best: DbParticipant | null = null;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const level = ratingsGiven.has(candidate.id) ? (ratingsGiven.get(candidate.id) as number) : null;
    const score = scoreCandidate(viewer.job_profile, candidate.job_profile, level);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}
