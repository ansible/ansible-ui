import './styles.css'

import { StrictMode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PageFrameworkProvider } from '../framework'
import ErrorBoundary from '../framework/components/ErrorBoundary'
import { AccessCode } from './common/AccessCode'
import { AutomationServersProvider } from './common/automation-servers/AutomationServerProvider'
import Login from './common/Login'
import { Controller } from './controller/Controller'
import { Hub } from './hub/Hub'
import { RouteE } from './Routes'

export default function Main() {
    const { t } = useTranslation()
    return (
        <StrictMode>
            <ErrorBoundary message={t('An eror occured')}>
                <AccessCode>
                    <AutomationServersProvider>
                        <BrowserRouter>
                            <PageFrameworkProvider>
                                <Routes>
                                    <Route path={RouteE.Login} element={<Login />} />
                                    <Route
                                        path={RouteE.Controller + '/*'}
                                        element={<Controller />}
                                    />
                                    <Route path={RouteE.Hub + '/*'} element={<Hub />} />
                                    <Route path="*" element={<Navigate to={RouteE.Login} />} />
                                </Routes>
                            </PageFrameworkProvider>
                        </BrowserRouter>
                    </AutomationServersProvider>
                </AccessCode>
            </ErrorBoundary>
        </StrictMode>
    )
}
