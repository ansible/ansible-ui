import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { RouteE } from '../Routes';
import { Token } from './access/token/Token';
import { Approvals } from './administration/approvals/Approvals';
import { RemoteRegistries } from './administration/remote-registries/RemoteRegistries';
import { Repositories } from './administration/repositories/Repositories';
import { TaskDetails } from './administration/tasks/TaskDetails';
import { Tasks } from './administration/tasks/Tasks';
import { CollectionDetails } from './automation-content/collections/CollectionDetails';
import { Collections } from './automation-content/collections/Collections';
import { UploadCollection } from './automation-content/collections/UploadCollection';
import { ExecutionEnvironments } from './automation-content/execution-environments/ExecutonEnvironments';
import { NamespaceDetails } from './automation-content/namespaces/NamespaceDetails';
import { Namespaces } from './automation-content/namespaces/Namespaces';
import { SignatureKeys } from './automation-content/signature-keys/SignatureKeys';
import { HubDashboard } from './dashboard/Dashboard';

export function HubRouter() {
  return (
    <Routes>
      <Route
        path={RouteE.HubAutomationServers.replace(RouteE.Hub, '')}
        element={<AutomationServers />}
      />
      <Route path={RouteE.HubDashboard.replace(RouteE.Hub, '')} element={<HubDashboard />} />
      <Route path={RouteE.Collections.replace(RouteE.Hub, '')} element={<Collections />} />
      <Route
        path={RouteE.UploadCollection.replace(RouteE.Hub, '')}
        element={<UploadCollection />}
      />
      <Route
        path={RouteE.CollectionDetails.replace(RouteE.Hub, '')}
        element={<CollectionDetails />}
      />

      <Route path={RouteE.Namespaces.replace(RouteE.Hub, '')} element={<Namespaces />} />
      <Route
        path={RouteE.NamespaceDetails.replace(RouteE.Hub, '')}
        element={<NamespaceDetails />}
      />

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
    </Routes>
  );
}
