import './styles.css';

import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PageFramework } from '../framework';
import ErrorBoundary from '../framework/components/ErrorBoundary';
import { RouteObj } from './Routes';
import { AWX } from './awx/Awx';
import { Disclaimer } from './common/Disclaimer';
import { Login } from './common/Login';
import { PageNotFound } from './common/PageNotFound';
import { EventDriven } from './eda/EventDriven';
import { Hub } from './hub/Hub';

export default function Main() {
  const { t } = useTranslation();
  return (
    // <StrictMode>
    <ErrorBoundary message={t('An error occured')}>
      <Disclaimer>
        <BrowserRouter>
          <Routing />
        </BrowserRouter>
      </Disclaimer>
    </ErrorBoundary>
    // </StrictMode>
  );
}

function Routing() {
  const navigate = useNavigate();

  return (
    <PageFramework navigate={navigate}>
      <Routes>
        {(!process.env.UI_MODE || process.env.UI_MODE === 'AWX') && (
          <Route path={RouteObj.AWX + '/*'} element={<AWX />} />
        )}
        {(!process.env.UI_MODE || process.env.UI_MODE === 'HUB') && (
          <Route path={RouteObj.Hub + '/*'} element={<Hub />} />
        )}
        {(!process.env.UI_MODE || process.env.UI_MODE === 'EDA') && (
          <Route path={RouteObj.Eda + '/*'} element={<EventDriven />} />
        )}
        <Route path={RouteObj.Login} element={<Login />} />
        <Route path="/" element={<Navigate to={RouteObj.Login} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageFramework>
  );
}
