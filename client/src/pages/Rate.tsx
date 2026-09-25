import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadParticipantToken } from '../helpers/participantSession';
import { fetchRateablePeople, submitRating } from '../hooks/useApi';
import type { RateablePerson } from '../hooks/useApi';

const LEVELS: Array<{ value: 0 | 1 | 2 | 3; label: string }> = [
  { value: 0, label: 'Never met' },
  { value: 1, label: 'Know who they are' },
  { value: 2, label: 'Have talked' },
  { value: 3, label: 'Know well' },
];

export default function Rate() {
  const navigate = useNavigate();
  const token = loadParticipantToken();
  const [people, setPeople] = useState<RateablePerson[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    fetchRateablePeople(token).then(setPeople);
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

  async function rate(level: number) {
    if (!token) return;
    await submitRating(token, current.participant.id, level);
    setIndex((i) => i + 1);
  }

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
          <button type="button" key={lvl.value} onClick={() => rate(lvl.value)}>
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
}
