import { lazy } from 'react';
import { createRoot } from 'react-dom/client';

const Main = lazy(() => import('./PlatformMain'));
document.body.innerHTML = '<div id="app"></div>';

document.body.style.backgroundColor = '#222';

const root = createRoot(document.getElementById('app')!);

root.render(<Main />);
