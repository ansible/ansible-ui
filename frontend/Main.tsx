import './styles.css'

import { StrictMode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { PageFramework } from '../framework'
import ErrorBoundary from '../framework/components/ErrorBoundary'
import {
  AutomationServersProvider,
  useAutomationServers,
} from './automation-servers/AutomationServerProvider'
import { AutomationServers } from './automation-servers/AutomationServers'
import { AccessCode } from './common/AccessCode'
import Login from './common/Login'
import { Controller } from './controller/Controller'
import { EventDriven } from './event-driven/EventDriven'
import { Hub } from './hub/Hub'
import { RouteE } from './Routes'

export default function Main() {
  const { t } = useTranslation()
  return (
    <StrictMode>
      <ErrorBoundary message={t('An error occured')}>
        <AccessCode>
          <AutomationServersProvider>
            <BrowserRouter>
              <Routing />
            </BrowserRouter>
          </AutomationServersProvider>
        </AccessCode>
      </ErrorBoundary>
    </StrictMode>
  )
}

function Routing() {
  const { automationServer } = useAutomationServers()
  const navigate = useNavigate()
  return (
    <PageFramework navigate={navigate}>
      <Routes>
        <Route path={RouteE.Login} element={<Login />} />
        <Route path={RouteE.AutomationServers} element={<AutomationServers />} />
        <Route path={RouteE.Controller + '/*'} element={<Controller />} />
        <Route path={RouteE.Eda + '/*'} element={<EventDriven />} />
        <Route path={RouteE.Hub + '/*'} element={<Hub />} />
        <Route
          path="*"
          element={
            <Navigate
              to={
                automationServer?.type === 'controller'
                  ? RouteE.Controller
                  : automationServer?.type === 'hub'
                  ? RouteE.Hub
                  : RouteE.AutomationServers
              }
            />
          }
        />
      </Routes>
    </PageFramework>
  )
}
