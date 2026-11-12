import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../assets/ui/theme.css';

const Library = lazy(() => import('./library/Library').then(module => ({ default: module.Library })));
const Lab = lazy(() => import('./App').then(module => ({ default: module.App })));
const SolarPanel = lazy(() => import('./solar/SolarPanel').then(module => ({ default: module.SolarPanel })));
const path = window.location.pathname.replace(/\/$/, '') || '/';
const root = document.getElementById('root');
if (!root) throw new Error('Root element not found.');
createRoot(root).render(<StrictMode><Suspense fallback={<p style={{ padding: 32 }}>Opening jhosephe…</p>}>{path === '/solar' ? <SolarPanel /> : path === '/lab' ? <Lab /> : <Library />}</Suspense></StrictMode>);
