// import '@patternfly/react-core/dist/styles/base.css'
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { createRoot } from 'react-dom/client';
import Main from './Main';
import './i18n';

createRoot(document.getElementById('root') as HTMLElement).render(<Main />);
