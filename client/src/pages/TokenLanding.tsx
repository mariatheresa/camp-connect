import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadParticipantToken, saveParticipantToken } from '../helpers/participantSession';
import { fetchParticipant, joinWithCode } from '../hooks/useApi';

export default function TokenLanding() {
  const navigate = useNavigate();
  const { token: urlToken } = useParams<{ token?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = urlToken ?? loadParticipantToken();
    if (!token) {
      setChecking(false);
      return;
    }
    fetchParticipant(token).then((data) => {
      if (data) {
        saveParticipantToken(token);
        navigate('/rate', { replace: true });
      } else {
        setError('That link is not valid — enter your code manually below.');
        setChecking(false);
      }
    });
  }, [urlToken, navigate]);

  async function handleManualSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const result = await joinWithCode(code.trim());
    if (!result) {
      setError('Invalid code — check it and try again.');
      return;
    }
    saveParticipantToken(result.token);
    navigate('/rate', { replace: true });
  }

  if (checking) return <p>Loading…</p>;

  return (
    <div>
      <h1>Camp Connect</h1>
      <p>Scan your QR code, or enter your code manually.</p>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleManualSubmit}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}
