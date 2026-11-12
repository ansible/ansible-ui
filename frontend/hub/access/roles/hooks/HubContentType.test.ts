import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { describe, expect, it } from 'vitest';
import { HubContentType } from './HubContentType';

describe('HubContentType', () => {
  it('maps hub resource types to gateway content type strings', () => {
    expect(HubContentType.Namespace).toBe('galaxy.namespace');
    expect(HubContentType.Collection).toBe('galaxy.collection');
    expect(HubContentType.ExecutionEnvironment).toBe('galaxy.containernamespace');
    expect(HubContentType.ContainerRegistryRemote).toBe('galaxy.containerregistryremote');
    expect(HubContentType.SyncList).toBe('galaxy.synclist');
    expect(HubContentType.Task).toBe('galaxy.task');
    expect(HubContentType.CollectionRemote).toBe('galaxy.collectionremote');
    expect(HubContentType.Repository).toBe('galaxy.ansiblerepository');
    expect(HubContentType.System).toBe('null');
    expect(HubContentType.Team).toBe(SharedContentType.Team);
  });
});
