import { Navigate, Route, Routes } from 'react-router-dom'
import { AutomationServersPage } from '../automation-servers/AutomationServersPage'
import { RouteE } from '../Routes'
import { Approvals } from './approvals/Approvals'
import { CollectionDetails } from './collections/CollectionDetails'
import { Collections } from './collections/Collections'
import { HubDashboard } from './dashboard/Dashboard'
import { ExecutionEnvironments } from './execution-environments/ExecutonEnvironments'
import { Namespaces } from './namespaces/Namespaces'
import { RemoteRegistries } from './remote-registries/RemoteRegistries'
import { Repositories } from './repositories/Repositories'
import { SignatureKeys } from './signature-keys/SignatureKeys'
import { TaskDetails } from './tasks/TaskDetails'
import { Tasks } from './tasks/Tasks'
import { Token } from './token/Token'

export function HubRouter() {
  return (
    <Routes>
      <Route
        path={RouteE.HubAutomationServers.replace(RouteE.Hub, '')}
        element={<AutomationServersPage />}
      />
      <Route path={RouteE.HubDashboard.replace(RouteE.Hub, '')} element={<HubDashboard />} />

      <Route path={RouteE.Collections.replace(RouteE.Hub, '')} element={<Collections />} />
      <Route
        path={RouteE.CollectionDetails.replace(RouteE.Hub, '')}
        element={<CollectionDetails />}
      />

      <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
      <Route path={RouteE.Repositories.replace(RouteE.Hub, '')} element={<Repositories />} />
      <Route path={RouteE.Approvals.replace(RouteE.Hub, '')} element={<Approvals />} />
      <Route
        path={RouteE.RemoteRegistries.replace(RouteE.Hub, '')}
        element={<RemoteRegistries />}
      />
      <Route
        path={RouteE.HubExecutionEnvironments.replace(RouteE.Hub, '')}
        element={<ExecutionEnvironments />}
      />
      <Route path={RouteE.Tasks.replace(RouteE.Hub, '')} element={<Tasks />} />
      <Route path={RouteE.TaskDetails.replace(RouteE.Hub, '')} element={<TaskDetails />} />
      <Route path={RouteE.SignatureKeys.replace(RouteE.Hub, '')} element={<SignatureKeys />} />
      <Route path={RouteE.APIToken.replace(RouteE.Hub, '')} element={<Token />} />
      <Route path="*" element={<Navigate to={RouteE.AutomationServers} replace />} />
    </Routes>
  )
}
