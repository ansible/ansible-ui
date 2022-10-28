import './styles.css'

import { StrictMode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PageFrameworkProvider } from '../framework'
import ErrorBoundary from '../framework/components/ErrorBoundary'
import {
  AutomationServersProvider,
  useAutomationServers,
} from './automation-servers/AutomationServerProvider'
import { AutomationServers } from './automation-servers/AutomationServers'
import { AccessCode } from './common/AccessCode'
import Login from './common/Login'
import { Controller } from './controller/Controller'
import { Hub } from './hub/Hub'
import { RouteE } from './Routes'

export default function Main() {
  const { t } = useTranslation()
  const { automationServer } = useAutomationServers()
  return (
    <StrictMode>
      <ErrorBoundary message={t('An eror occured')}>
        <AccessCode>
          <AutomationServersProvider>
            <BrowserRouter>
              <PageFrameworkProvider>
                <Routes>
                  <Route path={RouteE.Login} element={<Login />} />
                  <Route path={RouteE.AutomationServers} element={<AutomationServers />} />
                  <Route path={RouteE.Controller + '/*'} element={<Controller />} />
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
              </PageFrameworkProvider>
            </BrowserRouter>
          </AutomationServersProvider>
        </AccessCode>
      </ErrorBoundary>
    </StrictMode>
  )
}
