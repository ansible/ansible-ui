import './styles.css';

import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PageFramework } from '../framework';
import ErrorBoundary from '../framework/components/ErrorBoundary';
import { AutomationServersRoute } from './automation-servers/AutomationServersRoute';
import { AutomationServersProvider } from './automation-servers/contexts/AutomationServerProvider';
import { Disclaimer } from './common/Disclaimer';
import { Login } from './common/Login';
import { PageNotFound } from './common/PageNotFound';
import { shouldShowAutmationServers } from './common/should-show-autmation-servers';
import { Controller } from './awx/Controller';
import { EventDriven } from './eda/EventDriven';
import { Hub } from './hub/Hub';
import { RouteE } from './Routes';

export default function Main() {
  const { t } = useTranslation();
  return (
    // <StrictMode>
    <ErrorBoundary message={t('An error occured')}>
      <Disclaimer>
        <AutomationServersProvider>
          <BrowserRouter>
            <Routing />
          </BrowserRouter>
        </AutomationServersProvider>
      </Disclaimer>
    </ErrorBoundary>
    // </StrictMode>
  );
}

function Routing() {
  const navigate = useNavigate();

  const { showAutomationServers, showController, showHub, showEda } = shouldShowAutmationServers();

  return (
    <PageFramework navigate={navigate}>
      <Routes>
        {showAutomationServers && (
          <Route path={RouteE.AutomationServers} element={<AutomationServersRoute />} />
        )}
        {showController && <Route path={RouteE.Controller + '/*'} element={<Controller />} />}
        {showHub && <Route path={RouteE.Hub + '/*'} element={<Hub />} />}
        {showEda && <Route path={RouteE.Eda + '/*'} element={<EventDriven />} />}
        <Route path={RouteE.Login} element={<Login />} />
        {showAutomationServers ? (
          <Route path="/" element={<Navigate to={RouteE.AutomationServers} />} />
        ) : (
          <Route path="/" element={<Navigate to={RouteE.Login} />} />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}
