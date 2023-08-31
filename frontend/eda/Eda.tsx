import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import '../common/styles.css';

import { Page } from '@patternfly/react-core';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PageFramework } from '../../framework';
import ErrorBoundary from '../../framework/components/ErrorBoundary';
import { Login } from '../common/Login';
import { AnsibleMasthead } from '../common/Masthead';
import { PageNotFound } from '../common/PageNotFound';
import { RouteObj } from '../common/Routes';
import '../common/i18n';
import { ActiveEdaUserProvider } from '../common/useActiveUser';
import { EventDrivenRouter } from './EventDrivenRouter';
import { EventDrivenSidebar } from './EventDrivenSidebar';

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
    // <StrictMode>
    <ErrorBoundary message={t('An error occured')}>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </ErrorBoundary>
    // </StrictMode>
  );
}

function Routing() {
  const navigate = useNavigate();
  return (
    <PageFramework navigate={navigate}>
      <Routes>
        <Route path={RouteObj.Eda + '/*'} element={<EDA />} />
        <Route path={RouteObj.Login} element={<Login />} />
        <Route path="/" element={<Navigate to={RouteObj.Login} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}

export function EDA() {
  return (
    <ActiveEdaUserProvider>
      <Page header={<AnsibleMasthead />} sidebar={<EventDrivenSidebar />}>
        <EventDrivenRouter />
      </Page>
    </ActiveEdaUserProvider>
  );
}
