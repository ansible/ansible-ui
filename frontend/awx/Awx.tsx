import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import '../common/styles.css';

import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { PageApp } from '../../framework/PageNavigation/PageApp';
import ErrorBoundary from '../../framework/components/ErrorBoundary';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { useAwxNavigation } from './useAwxNavigation';

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

export default function Main() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary message={t('An error occured')}>
      <AWX />
    </ErrorBoundary>
  );
}

export function AWX() {
  const awxNavigation = useAwxNavigation();
  return (
    // <Page header={<AnsibleMasthead />} sidebar={<AwxSidebar />}>
    <PageApp navigationItems={awxNavigation} header={<AnsibleMasthead />} />
    // </Page>
  );
}
