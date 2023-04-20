// import '@patternfly/react-core/dist/styles/base.css'
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import Main from './Main';
import './i18n';

const container = document.createElement('div');
container.style.position = 'fixed';
container.style.width = '100%';
container.style.height = '100%';
container.style.overflow = 'hidden';
document.body.appendChild(container);
const root = createRoot(container);

root.render(
  <Suspense fallback={<div />}>
    <Main />
  </Suspense>
);

/* istanbul ignore next */
if (process.env.PWA === 'true' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      // .then((registration) => {
      //     console.log('SW registered: ', registration)
      // })
      .catch((registrationError) => {
        // eslint-disable-next-line no-console
        console.error('SW registration failed: ', registrationError);
      });
  });
}
