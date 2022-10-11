import './styles.css'

import { StrictMode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PageFrameworkProvider } from '../framework'
import ErrorBoundary from '../framework/components/ErrorBoundary'
import { AccessCode } from './common/AccessCode'
import { Controller } from './controller/Controller'
import Login from './controller/settings/Login'
import { RouteE } from './route'

export default function Demo() {
    const { t } = useTranslation()
    return (
        <StrictMode>
            <ErrorBoundary message={t('An eror occured')}>
                <AccessCode>
                    <PageFrameworkProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path={RouteE.Login} element={<Login />} />
                                <Route path="/controller/*" element={<Controller />} />
                                <Route path="*" element={<Navigate to={RouteE.Login} />} />
                            </Routes>
                        </BrowserRouter>
                    </PageFrameworkProvider>
                </AccessCode>
            </ErrorBoundary>
        </StrictMode>
    )
}
