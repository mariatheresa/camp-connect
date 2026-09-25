import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchParticipant, fetchSuggestion, joinWithCode, submitRating } from '../src/hooks/useApi';

describe('useApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchParticipant returns parsed JSON on success', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ participant: { id: 'p1' }, progress: { rated: 0, total: 1 } }),
    });
    const result = await fetchParticipant('tok');
    expect(result?.participant.id).toBe('p1');
  });

  it('fetchParticipant returns null on a non-ok response', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    const result = await fetchParticipant('bad-token');
    expect(result).toBeNull();
  });

  it('submitRating posts the body and returns whether it succeeded', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const ok = await submitRating('tok', 'p2', 3);
    expect(ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      '/api/p/tok/ratings',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fetchSuggestion returns null when the server has none left', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ suggestion: null }),
    });
    const result = await fetchSuggestion('tok', []);
    expect(result).toBeNull();
  });

  it('joinWithCode returns null on an invalid code', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    const result = await joinWithCode('nonsense');
    expect(result).toBeNull();
  });
});
