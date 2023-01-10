import './styles.css';

import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PageFramework } from '../framework';
import ErrorBoundary from '../framework/components/ErrorBoundary';
import { AutomationServersRoute } from './automation-servers/AutomationServersRoute';
import { AutomationServersProvider } from './automation-servers/contexts/AutomationServerProvider';
import { AccessCode } from './common/AccessCode';
import { Login } from './common/Login';
import { PageNotFound } from './common/PageNotFound';
import { Controller } from './controller/Controller';
import { EventDriven } from './eda/EventDriven';
import { Hub } from './hub/Hub';
import { RouteE } from './Routes';

export default function Main() {
  const { t } = useTranslation();
  return (
    // <StrictMode>
    <ErrorBoundary message={t('An error occured')}>
      <AccessCode>
        <AutomationServersProvider>
          <BrowserRouter>
            <Routing />
          </BrowserRouter>
        </AutomationServersProvider>
      </AccessCode>
    </ErrorBoundary>
    // </StrictMode>
  );
}

function Routing() {
  const navigate = useNavigate();
  return (
    <PageFramework navigate={navigate}>
      <Routes>
        <Route path={RouteE.AutomationServers} element={<AutomationServersRoute />} />
        <Route path={RouteE.Controller + '/*'} element={<Controller />} />
        <Route path={RouteE.Eda + '/*'} element={<EventDriven />} />
        <Route path={RouteE.Hub + '/*'} element={<Hub />} />
        <Route path={RouteE.Login + '/*'} element={<Login />} />
        <Route path="/" element={<Navigate to={RouteE.AutomationServers} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}
