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
import { AnsibleMasthead } from '../common/Masthead';
import { PageNotFound } from '../common/PageNotFound';
import { RouteObj } from '../common/Routes';
import '../common/i18n';
import { ActiveUserProvider } from '../common/useActiveUser';
import { AwxRouter } from './AwxRouter';
import { AwxSidebar } from './AwxSidebar';
import { AwxLogin } from './AwxLogin';
import { AwxConfigProvider } from './common/useAwxConfig';
import { WebSocketProvider } from './common/useAwxWebSocket';

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
        <Route path={RouteObj.AWX + '/*'} element={<AWX />} />
        <Route path={RouteObj.Login} element={<AwxLogin />} />
        <Route path="/" element={<Navigate to={RouteObj.Dashboard} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}

export function AWX() {
  return (
    <WebSocketProvider>
      <ActiveUserProvider>
        <AwxConfigProvider>
          <Page header={<AnsibleMasthead />} sidebar={<AwxSidebar />}>
            <AwxRouter />
          </Page>
        </AwxConfigProvider>
      </ActiveUserProvider>
    </WebSocketProvider>
  );
}
