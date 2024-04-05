import { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const Main = lazy(() => import('./EdaMain'));

document.body.innerHTML = '<div id="app"></div>';

const root = createRoot(document.getElementById('app')!);
root.render(
  <BrowserRouter>
    <Main />
  </BrowserRouter>
);
