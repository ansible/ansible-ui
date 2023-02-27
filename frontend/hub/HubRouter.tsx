import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
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
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.Hub);

  return (
    <Routes>
      <Route path={RouteObjWithoutPrefix.HubAutomationServers} element={<AutomationServers />} />
      <Route path={RouteObjWithoutPrefix.HubDashboard} element={<HubDashboard />} />
      <Route path={RouteObjWithoutPrefix.Collections} element={<Collections />} />
      <Route path={RouteObjWithoutPrefix.UploadCollection} element={<UploadCollection />} />
      <Route path={RouteObjWithoutPrefix.CollectionDetails} element={<CollectionDetails />} />

      <Route path={RouteObjWithoutPrefix.Namespaces} element={<Namespaces />} />
      <Route path={RouteObjWithoutPrefix.NamespaceDetails} element={<NamespaceDetails />} />

      <Route path={RouteObjWithoutPrefix.Repositories} element={<Repositories />} />
      <Route path={RouteObjWithoutPrefix.Approvals} element={<Approvals />} />
      <Route path={RouteObjWithoutPrefix.RemoteRegistries} element={<RemoteRegistries />} />
      <Route
        path={RouteObjWithoutPrefix.HubExecutionEnvironments}
        element={<ExecutionEnvironments />}
      />
      <Route path={RouteObjWithoutPrefix.Tasks} element={<Tasks />} />
      <Route path={RouteObjWithoutPrefix.TaskDetails} element={<TaskDetails />} />
      <Route path={RouteObjWithoutPrefix.SignatureKeys} element={<SignatureKeys />} />
      <Route path={RouteObjWithoutPrefix.APIToken} element={<Token />} />
    </Routes>
  );
}
