import { lazy } from 'react';
import { createRoot } from 'react-dom/client';

const Main = lazy(() => import('./PlatformMain'));
document.body.innerHTML = '<div id="app"></div>';

const botNameEl = document.createElement('div');
botNameEl.id = 'bot_name';
botNameEl.hidden = true;
botNameEl.textContent = 'Automation Intelligent Assistant';
document.body.appendChild(botNameEl);

document.body.style.backgroundColor = '#222';

const root = createRoot(document.getElementById('app')!);

root.render(<Main />);
