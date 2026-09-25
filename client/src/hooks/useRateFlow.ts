import { useEffect, useRef, useState } from 'react';
import { fetchRateablePeople, submitRating } from './useApi';
import type { RateablePerson } from './useApi';

/** Index of the first not-yet-rated person, or `people.length` if everyone is rated. */
export function firstUnratedIndex(people: RateablePerson[]): number {
  const idx = people.findIndex((p) => p.level === null);
  return idx === -1 ? people.length : idx;
}

export function useRateFlow(token: string | null) {
  const [people, setPeople] = useState<RateablePerson[] | null>(null);
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    fetchRateablePeople(token).then((p) => {
      setPeople(p);
      setIndex(firstUnratedIndex(p));
    });
  }, [token]);

  async function rate(level: number): Promise<void> {
    if (!token || !people || submittingRef.current) return;
    const current = people[index];
    if (!current) return;

    submittingRef.current = true;
    setSubmitting(true);
    await submitRating(token, current.participant.id, level);
    setIndex((i) => i + 1);
    submittingRef.current = false;
    setSubmitting(false);
  }

  return { people, index, submitting, rate };
}
