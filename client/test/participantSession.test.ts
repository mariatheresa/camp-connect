import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearParticipantToken,
  loadParticipantToken,
  saveParticipantToken,
} from '../src/helpers/participantSession';

describe('participantSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing is stored', () => {
    expect(loadParticipantToken()).toBeNull();
  });

  it('round-trips a saved token', () => {
    saveParticipantToken('abc123');
    expect(loadParticipantToken()).toBe('abc123');
  });

  it('clears the stored token', () => {
    saveParticipantToken('abc123');
    clearParticipantToken();
    expect(loadParticipantToken()).toBeNull();
  });
});
