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
import { Galaxy } from './galaxy/Galaxy';
import { RouteObj } from './Routes';

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

  const { showAutomationServers, showAWX, showGalaxy, showEda } = shouldShowAutmationServers();

  return (
    <PageFramework navigate={navigate}>
      <Routes>
        {showAutomationServers && (
          <Route path={RouteObj.AutomationServers} element={<AutomationServersRoute />} />
        )}
        {showAWX && <Route path={RouteObj.AWX + '/*'} element={<AWX />} />}
        {showGalaxy && <Route path={RouteObj.Galaxy + '/*'} element={<Galaxy />} />}
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
