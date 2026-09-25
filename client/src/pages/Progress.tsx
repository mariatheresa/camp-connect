import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadParticipantToken } from '../helpers/participantSession';
import { fetchParticipant } from '../hooks/useApi';
import type { ParticipantResponse } from '../hooks/useApi';

export default function Progress() {
  const navigate = useNavigate();
  const token = loadParticipantToken();
  const [data, setData] = useState<ParticipantResponse | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    fetchParticipant(token).then(setData);
  }, [token, navigate]);

  if (!token) return null;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h2>Your progress</h2>
      <p>
        {data.progress.rated} / {data.progress.total} rated
      </p>
      <button type="button" onClick={() => navigate('/rate')}>
        Rate more people
      </button>
      <button type="button" onClick={() => navigate('/suggestion')}>
        Get a suggestion
      </button>
    </div>
  );
}
