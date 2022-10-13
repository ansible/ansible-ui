import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'
import { Namespaces } from './collections/namespaces/Namespaces'
import { Repositories } from './collections/repositories/Repositories'

export function HubRouter() {
    return (
        <Routes>
            <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
            <Route path={RouteE.Repositories.replace(RouteE.Hub, '')} element={<Repositories />} />
            <Route path="*" element={<Navigate to={RouteE.Repositories} replace />} />
        </Routes>
    )
}
