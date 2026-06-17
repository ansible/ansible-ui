import { lazy } from 'react';
import { createRoot } from 'react-dom/client';

const Main = lazy(() => import('./PlatformMain'));
const botNameEl = document.getElementById('bot_name');
document.body.innerHTML = '<div id="app"></div>';
if (botNameEl) document.body.appendChild(botNameEl);

document.body.style.backgroundColor = '#222';

const root = createRoot(document.getElementById('app')!);

root.render(<Main />);
