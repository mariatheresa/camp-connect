const STORAGE_KEY = 'campConnectToken';

export function loadParticipantToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function saveParticipantToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearParticipantToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
