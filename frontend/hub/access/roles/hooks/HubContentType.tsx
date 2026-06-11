import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';

export enum HubContentType {
  Namespace = 'galaxy.namespace',
  Collection = 'galaxy.collection',
  ExecutionEnvironment = 'galaxy.containernamespace',
  ContainerRegistryRemote = 'galaxy.containerregistryremote',
  SyncList = 'galaxy.synclist',
  Task = 'galaxy.task',
  CollectionRemote = 'galaxy.collectionremote',
  Repository = 'galaxy.ansiblerepository',
  System = 'null',
  Team = SharedContentType.Team,
}
