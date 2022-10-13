import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'
import { Namespaces } from './collections/namespaces/Namespaces'
import { Repositories } from './collections/repositories/Repositories'
import { Tasks } from './collections/task-management/Tasks'

export function HubRouter() {
    return (
        <Routes>
            <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
            <Route path={RouteE.Repositories.replace(RouteE.Hub, '')} element={<Repositories />} />
            <Route path={RouteE.Tasks.replace(RouteE.Hub, '')} element={<Tasks />} />
            <Route path="*" element={<Navigate to={RouteE.Repositories} replace />} />
        </Routes>
    )
}
