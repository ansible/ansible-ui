import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import '../common/styles.css';

import { createRoot } from 'react-dom/client';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { useAwxNavigation } from './useAwxNavigation';

const container = document.createElement('div');
container.style.position = 'fixed';
container.style.width = '100%';
container.style.height = '100%';
container.style.overflow = 'hidden';
document.body.appendChild(container);

createRoot(container).render(<AWX />);

export function AWX() {
  const awxNavigation = useAwxNavigation();
  return <PageApp header={<AnsibleMasthead />} navigationItems={awxNavigation} />;
}
