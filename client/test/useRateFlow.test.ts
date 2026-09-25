import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../src/hooks/useApi';
import { firstUnratedIndex, useRateFlow } from '../src/hooks/useRateFlow';
import type { RateablePerson } from '../src/hooks/useApi';

function person(id: string, level: number | null): RateablePerson {
  return { participant: { id, name: id, photo_path: null, job_profile: null, title: null }, level };
}

describe('firstUnratedIndex', () => {
  it('returns 0 when nothing has been rated', () => {
    expect(firstUnratedIndex([person('p1', null), person('p2', null)])).toBe(0);
  });

  it('skips already-rated people and resumes at the first unrated one', () => {
    expect(firstUnratedIndex([person('p1', 2), person('p2', null), person('p3', 3)])).toBe(1);
  });

  it('returns the list length when everyone is already rated', () => {
    expect(firstUnratedIndex([person('p1', 1), person('p2', 3)])).toBe(2);
  });
});

describe('useRateFlow', () => {
  beforeEach(() => {
    vi.spyOn(api, 'fetchRateablePeople').mockResolvedValue([person('p1', null), person('p2', null)]);
    vi.spyOn(api, 'submitRating').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts at the first unrated person once people load', async () => {
    const { result } = renderHook(() => useRateFlow('tok'));
    await waitFor(() => expect(result.current.people).not.toBeNull());
    expect(result.current.index).toBe(0);
  });

  it('resumes past already-rated people on load (reconnect on day 2)', async () => {
    (api.fetchRateablePeople as ReturnType<typeof vi.fn>).mockResolvedValue([
      person('p1', 2),
      person('p2', null),
    ]);
    const { result } = renderHook(() => useRateFlow('tok'));
    await waitFor(() => expect(result.current.people).not.toBeNull());
    expect(result.current.index).toBe(1);
  });

  it('does not skip a person when rate() is double-tapped rapidly', async () => {
    const { result } = renderHook(() => useRateFlow('tok'));
    await waitFor(() => expect(result.current.people).not.toBeNull());

    await act(async () => {
      const first = result.current.rate(0);
      const second = result.current.rate(0);
      await Promise.all([first, second]);
    });

    expect(api.submitRating).toHaveBeenCalledTimes(1);
    expect(result.current.index).toBe(1);
  });
});
