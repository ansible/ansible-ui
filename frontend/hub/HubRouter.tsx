import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'
import { Token } from './access/token/Token'
import { Approvals } from './collections/approvals/Approvals'
import { Collections } from './collections/collections/Collections'
import { Namespaces } from './collections/namespaces/Namespaces'
import { Repositories } from './collections/repositories/Repositories'
import { SignatureKeys } from './collections/signature-keys/SignatureKeys'
import { Tasks } from './collections/tasks/Tasks'

export function HubRouter() {
    return (
        <Routes>
            <Route path={RouteE.Collections.replace(RouteE.Hub, '')} element={<Collections />} />
            <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
            <Route path={RouteE.Repositories.replace(RouteE.Hub, '')} element={<Repositories />} />
            <Route path={RouteE.Approvals.replace(RouteE.Hub, '')} element={<Approvals />} />
            <Route path={RouteE.Tasks.replace(RouteE.Hub, '')} element={<Tasks />} />
            <Route path={RouteE.SignatureKeys.replace(RouteE.Hub, '')} element={<SignatureKeys />} />
            <Route path={RouteE.APIToken.replace(RouteE.Hub, '')} element={<Token />} />
            <Route path="*" element={<Navigate to={RouteE.Repositories} replace />} />
        </Routes>
    )
}
