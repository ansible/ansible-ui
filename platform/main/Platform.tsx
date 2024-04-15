import { lazy } from 'react';
import { createRoot } from 'react-dom/client';

const Main = lazy(() => import('./PlatformMain'));
document.body.innerHTML = '<div id="app"></div>';

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.style.backgroundColor = 'rgb(27, 29, 33)';
}

const root = createRoot(document.getElementById('app')!);

root.render(<Main />);
