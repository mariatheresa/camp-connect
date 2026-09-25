import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadParticipantToken } from '../helpers/participantSession';
import { useRateFlow } from '../hooks/useRateFlow';

const LEVELS: Array<{ value: 0 | 1 | 2 | 3; label: string }> = [
  { value: 0, label: 'Never met' },
  { value: 1, label: 'Know who they are' },
  { value: 2, label: 'Have talked' },
  { value: 3, label: 'Know well' },
];

export default function Rate() {
  const navigate = useNavigate();
  const token = loadParticipantToken();
  const { people, index, submitting, rate } = useRateFlow(token);

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (people && index >= people.length) {
      navigate('/suggestion', { replace: true });
    }
  }, [people, index, navigate]);

  if (!token) return null;
  if (!people) return <p>Loading…</p>;
  if (people.length === 0) return <p>No one else to rate yet.</p>;
  if (index >= people.length) return null;

  const current = people[index];

  return (
    <div>
      <p>
        {index + 1} / {people.length}
      </p>
      <h2>{current.participant.name}</h2>
      <p>
        {current.participant.title ?? ''} {current.participant.job_profile ? `· ${current.participant.job_profile}` : ''}
      </p>
      <div>
        {LEVELS.map((lvl) => (
          <button type="button" key={lvl.value} disabled={submitting} onClick={() => rate(lvl.value)}>
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
}
