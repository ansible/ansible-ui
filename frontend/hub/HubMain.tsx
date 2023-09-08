import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { Page } from '@patternfly/react-core';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PageFramework } from '../../framework';
import { Login } from '../common/Login';
import { AnsibleMasthead } from '../common/Masthead';
import { PageNotFound } from '../common/PageNotFound';
import { RouteObj } from '../common/Routes';
import '../common/i18n';
import { HubRouter } from './HubRouter';
import { HubSidebar } from './HubSidebar';
import { HubContextProvider } from './useHubContext';

export default function HubMain() {
  return (
    <BrowserRouter>
      <HubRouting />
    </BrowserRouter>
  );
}

function HubRouting() {
  const navigate = useNavigate();
  return (
    <PageFramework navigate={navigate}>
      <Routes>
        <Route
          path={RouteObj.Hub + '/*'}
          element={
            <Page header={<AnsibleMasthead />} sidebar={<HubSidebar />}>
              <HubContextProvider>
                <HubRouter />
              </HubContextProvider>
            </Page>
          }
        />
        <Route path={RouteObj.Login} element={<Login />} />
        <Route path="/" element={<Navigate to={RouteObj.Login} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}
