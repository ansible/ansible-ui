import { Route, Routes } from 'react-router-dom';
import { RouteObj, useRoutesWithoutPrefix } from '../common/Routes';
import { Approvals } from './approvals/Approvals';
import { CollectionDetails } from './collections/CollectionDetails';
import { Collections } from './collections/Collections';
import { UploadCollection } from './collections/UploadCollection';
import { HubDashboard } from './dashboard/Dashboard';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import { NamespaceDetails } from './namespaces/HubNamespaceDetails';
import { CreateHubNamespace, EditHubNamespace } from './namespaces/HubNamespaceForm';
import { Namespaces } from './namespaces/HubNamespaces';
import { RemoteRegistries } from './remote-registries/RemoteRegistries';
import { CreateRemote, EditRemote } from './remotes/RemoteForm';
import { Remotes } from './remotes/Remotes';
import { Repositories } from './repositories/Repositories';
import { SignatureKeys } from './signature-keys/SignatureKeys';
import { TaskDetails } from './tasks/TaskDetails';
import { Tasks } from './tasks/Tasks';
import { Token } from './token/Token';
import { RemoteDetails } from './remotes/RemoteDetails';

export function HubRouter() {
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.Hub);

  return (
    <Routes>
      <Route path={RouteObjWithoutPrefix.HubDashboard} element={<HubDashboard />} />
      <Route path={RouteObjWithoutPrefix.Collections} element={<Collections />} />
      <Route path={RouteObjWithoutPrefix.UploadCollection} element={<UploadCollection />} />
      <Route path={RouteObjWithoutPrefix.CollectionDetails} element={<CollectionDetails />} />

      <Route path={RouteObjWithoutPrefix.Namespaces} element={<Namespaces />} />
      <Route path={RouteObjWithoutPrefix.CreateNamespace} element={<CreateHubNamespace />} />
      <Route path={RouteObjWithoutPrefix.EditNamespace} element={<EditHubNamespace />} />
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
      <Route path={RouteObjWithoutPrefix.Remotes} element={<Remotes />} />
      <Route path={RouteObjWithoutPrefix.CreateRemotes} element={<CreateRemote />} />
      <Route path={RouteObjWithoutPrefix.EditRemotes} element={<EditRemote />} />
      <Route path={RouteObjWithoutPrefix.RemoteDetails} element={<RemoteDetails />} />
    </Routes>
  );
}
