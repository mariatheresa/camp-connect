import { lazy, type ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const TokenLanding = lazy(() => import('./pages/TokenLanding'));
const Rate = lazy(() => import('./pages/Rate'));
const Suggestion = lazy(() => import('./pages/Suggestion'));
const Progress = lazy(() => import('./pages/Progress'));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Lazy>
            <TokenLanding />
          </Lazy>
        }
      />
      <Route
        path="/p/:token"
        element={
          <Lazy>
            <TokenLanding />
          </Lazy>
        }
      />
      <Route
        path="/rate"
        element={
          <Lazy>
            <Rate />
          </Lazy>
        }
      />
      <Route
        path="/suggestion"
        element={
          <Lazy>
            <Suggestion />
          </Lazy>
        }
      />
      <Route
        path="/progress"
        element={
          <Lazy>
            <Progress />
          </Lazy>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
