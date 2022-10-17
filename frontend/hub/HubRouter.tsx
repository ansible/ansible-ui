import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'
import { Approvals } from './collections/approvals/Approvals'
import { Collections } from './collections/collections/Collections'
import { Namespaces } from './collections/namespaces/Namespaces'
import { Repositories } from './collections/repositories/Repositories'
import { Token } from './collections/Token'
import { ExecutionEnvironments } from './execution-environments/execution-environments/ExecutonEnvironments'
import { RemoteRegistries } from './execution-environments/remote-registries/RemoteRegistries'
import { SignatureKeys } from './signature-keys/SignatureKeys'
import { Tasks } from './tasks/Tasks'

export function HubRouter() {
    return (
        <Routes>
            <Route path={RouteE.Collections.replace(RouteE.Hub, '')} element={<Collections />} />
            <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
            <Route path={RouteE.Repositories.replace(RouteE.Hub, '')} element={<Repositories />} />
            <Route path={RouteE.Approvals.replace(RouteE.Hub, '')} element={<Approvals />} />
            <Route path={RouteE.RemoteRegistries.replace(RouteE.Hub, '')} element={<RemoteRegistries />} />
            <Route path={RouteE.HubExecutionEnvironments.replace(RouteE.Hub, '')} element={<ExecutionEnvironments />} />
            <Route path={RouteE.Tasks.replace(RouteE.Hub, '')} element={<Tasks />} />
            <Route path={RouteE.SignatureKeys.replace(RouteE.Hub, '')} element={<SignatureKeys />} />
            <Route path={RouteE.APIToken.replace(RouteE.Hub, '')} element={<Token />} />
            <Route path="*" element={<Navigate to={RouteE.Collections} replace />} />
        </Routes>
    )
}
