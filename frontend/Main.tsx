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
import { AWX } from './awx/Awx';
import { EventDriven } from './eda/EventDriven';
import { Hub } from './hub/Hub';
import { RouteObj } from './Routes';
import { ActiveUserProvider } from './common/useActiveUser';

export default function Main() {
  const { t } = useTranslation();
  return (
    // <StrictMode>
    <ErrorBoundary message={t('An error occured')}>
      <Disclaimer>
        <AutomationServersProvider>
          <ActiveUserProvider>
            <BrowserRouter>
              <Routing />
            </BrowserRouter>
          </ActiveUserProvider>
        </AutomationServersProvider>
      </Disclaimer>
    </ErrorBoundary>
    // </StrictMode>
  );
}

function Routing() {
  const navigate = useNavigate();

  const { showAutomationServers, showAWX, showHub, showEda } = shouldShowAutmationServers();

  return (
    <PageFramework navigate={navigate}>
      <Routes>
        {showAutomationServers && (
          <Route path={RouteObj.AutomationServers} element={<AutomationServersRoute />} />
        )}
        {showAWX && <Route path={RouteObj.AWX + '/*'} element={<AWX />} />}
        {showHub && <Route path={RouteObj.Hub + '/*'} element={<Hub />} />}
        {showEda && <Route path={RouteObj.Eda + '/*'} element={<EventDriven />} />}
        <Route path={RouteObj.Login} element={<Login />} />
        {showAutomationServers ? (
          <Route path="/" element={<Navigate to={RouteObj.AutomationServers} />} />
        ) : (
          <Route path="/" element={<Navigate to={RouteObj.Login} />} />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}
