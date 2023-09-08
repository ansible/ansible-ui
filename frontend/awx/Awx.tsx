import { lazy } from 'react';
import { createRoot } from 'react-dom/client';
const AwxMain = lazy(() => import('./AwxMain'));
document.body.innerHTML = '<div id="app"></div>';
const root = createRoot(document.getElementById('app')!);
root.render(<AwxMain />);
