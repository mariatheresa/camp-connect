import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadParticipantToken } from '../helpers/participantSession';
import { fetchSuggestion, submitRating } from '../hooks/useApi';
import type { Participant } from '../hooks/useApi';

export default function Suggestion() {
  const navigate = useNavigate();
  const token = loadParticipantToken();
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadNext(exclude: string[]) {
    if (!token) return;
    setLoading(true);
    const suggestion = await fetchSuggestion(token, exclude);
    setCurrent(suggestion);
    setLoading(false);
  }

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    loadNext([]);
    // Only re-run when the token itself changes, not on every `shown` update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return null;
  if (loading) return <p>Loading…</p>;
  if (!current) return <p>You've rated everyone — nice work!</p>;

  async function markAsTalked() {
    if (!token || !current) return;
    await submitRating(token, current.id, 2);
    const nextShown = [...shown, current.id];
    setShown(nextShown);
    loadNext(nextShown);
  }

  function nextSuggestion() {
    if (!current) return;
    const nextShown = [...shown, current.id];
    setShown(nextShown);
    loadNext(nextShown);
  }

  return (
    <div>
      <h2>You should talk to {current.name}</h2>
      <p>
        {current.title ?? ''} {current.job_profile ? `· ${current.job_profile}` : ''}
      </p>
      <button type="button" onClick={markAsTalked}>
        Mark as talked to
      </button>
      <button type="button" onClick={nextSuggestion}>
        Next suggestion
      </button>
      <button type="button" onClick={() => navigate('/progress')}>
        View progress
      </button>
    </div>
  );
}
