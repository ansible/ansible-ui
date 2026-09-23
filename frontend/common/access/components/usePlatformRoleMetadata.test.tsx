/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  PlatformContentTypeEnum,
  groupFromRoleType,
  usePlatformRoleMetadata,
} from './usePlatformRoleMetadata';

describe('groupFromRoleType', () => {
  it('should return Automation Execution for awx types', () => {
    const t = (v: string) => v;
    expect(groupFromRoleType('awx.credential', t)).toBe('Automation Execution');
    expect(groupFromRoleType('awx.inventory', t)).toBe('Automation Execution');
  });

  it('should return Automation Decisions for eda types', () => {
    const t = (v: string) => v;
    expect(groupFromRoleType('eda.activation', t)).toBe('Automation Decisions');
    expect(groupFromRoleType('eda.project', t)).toBe('Automation Decisions');
  });

  it('should return Automation Content for galaxy types', () => {
    const t = (v: string) => v;
    expect(groupFromRoleType('galaxy.namespace', t)).toBe('Automation Content');
    expect(groupFromRoleType('galaxy.collection', t)).toBe('Automation Content');
  });

  it('should return empty string for unknown types', () => {
    const t = (v: string) => v;
    expect(groupFromRoleType('shared.organization', t)).toBe('');
    expect(groupFromRoleType('null', t)).toBe('');
  });
});

describe('PlatformContentTypeEnum', () => {
  it('should have expected values for AWX content types', () => {
    expect(PlatformContentTypeEnum.Credential).toBe('awx.credential');
    expect(PlatformContentTypeEnum.ExecutionEnvironment).toBe('awx.executionenvironment');
    expect(PlatformContentTypeEnum.InstanceGroup).toBe('awx.instancegroup');
    expect(PlatformContentTypeEnum.Inventory).toBe('awx.inventory');
    expect(PlatformContentTypeEnum.JobTemplate).toBe('awx.jobtemplate');
    expect(PlatformContentTypeEnum.NotificationTemplate).toBe('awx.notificationtemplate');
    expect(PlatformContentTypeEnum.Project).toBe('awx.project');
    expect(PlatformContentTypeEnum.WorkflowJobTemplate).toBe('awx.workflowjobtemplate');
  });

  it('should have expected values for shared content types', () => {
    expect(PlatformContentTypeEnum.Organization).toBe('shared.organization');
    expect(PlatformContentTypeEnum.Team).toBe('shared.team');
  });

  it('should have expected values for EDA content types', () => {
    expect(PlatformContentTypeEnum.Activation).toBe('eda.activation');
    expect(PlatformContentTypeEnum.AuditRule).toBe('eda.auditrule');
    expect(PlatformContentTypeEnum.EdaCredential).toBe('eda.edacredential');
    expect(PlatformContentTypeEnum.DecisionEnvironment).toBe('eda.decisionenvironment');
    expect(PlatformContentTypeEnum.EventStream).toBe('eda.eventstream');
    expect(PlatformContentTypeEnum.EdaProject).toBe('eda.project');
    expect(PlatformContentTypeEnum.Rulebook).toBe('eda.rulebook');
    expect(PlatformContentTypeEnum.RulebookProcess).toBe('eda.rulebookprocess');
  });

  it('should have expected values for Hub content types', () => {
    expect(PlatformContentTypeEnum.Namespace).toBe('galaxy.namespace');
    expect(PlatformContentTypeEnum.Collection).toBe('galaxy.collection');
    expect(PlatformContentTypeEnum.HubExecutionEnvironment).toBe('galaxy.containernamespace');
    expect(PlatformContentTypeEnum.ContainerRegistryRemote).toBe('galaxy.containerregistryremote');
    expect(PlatformContentTypeEnum.SyncList).toBe('galaxy.synclist');
    expect(PlatformContentTypeEnum.Task).toBe('galaxy.task');
    expect(PlatformContentTypeEnum.CollectionRemote).toBe('galaxy.collectionremote');
    expect(PlatformContentTypeEnum.Repository).toBe('galaxy.ansiblerepository');
  });

  it('should have a System type with null value', () => {
    expect(PlatformContentTypeEnum.System).toBe('null');
  });
});

describe('usePlatformRoleMetadata', () => {
  it('should return an object with content_types', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    expect(result.current).toHaveProperty('content_types');
    expect(typeof result.current.content_types).toBe('object');
  });

  it('should have metadata for all PlatformContentTypeEnum values', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    const expectedKeys = Object.values(PlatformContentTypeEnum);
    for (const key of expectedKeys) {
      expect(contentTypes).toHaveProperty(key);
    }
  });

  it('should have displayName and permissions for each content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    for (const key of Object.keys(contentTypes)) {
      const meta = contentTypes[key as PlatformContentTypeEnum];
      expect(meta).toHaveProperty('displayName');
      expect(typeof meta.displayName).toBe('string');
      expect(meta).toHaveProperty('permissions');
      expect(typeof meta.permissions).toBe('object');
    }
  });

  it('should return correct display names for AWX content types', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    expect(contentTypes[PlatformContentTypeEnum.Credential].displayName).toBe(
      'Credential (Automation Execution)'
    );
    expect(contentTypes[PlatformContentTypeEnum.ExecutionEnvironment].displayName).toBe(
      'Execution environment'
    );
    expect(contentTypes[PlatformContentTypeEnum.InstanceGroup].displayName).toBe('Instance group');
    expect(contentTypes[PlatformContentTypeEnum.Inventory].displayName).toBe('Inventory');
    expect(contentTypes[PlatformContentTypeEnum.JobTemplate].displayName).toBe('Job template');
    expect(contentTypes[PlatformContentTypeEnum.Project].displayName).toBe(
      'Project (Automation Execution)'
    );
  });

  it('should return correct display names for shared content types', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    expect(contentTypes[PlatformContentTypeEnum.Organization].displayName).toBe('Organization');
    expect(contentTypes[PlatformContentTypeEnum.Team].displayName).toBe('Team');
  });

  it('should return correct display names for EDA content types', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    expect(contentTypes[PlatformContentTypeEnum.Activation].displayName).toBe(
      'Rulebook Activation'
    );
    expect(contentTypes[PlatformContentTypeEnum.EdaCredential].displayName).toBe(
      'Credential (Automation Decisions)'
    );
    expect(contentTypes[PlatformContentTypeEnum.DecisionEnvironment].displayName).toBe(
      'Decision Environment'
    );
  });

  it('should return correct display names for Hub content types', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const contentTypes = result.current.content_types;

    expect(contentTypes[PlatformContentTypeEnum.Namespace].displayName).toBe('Namespace');
    expect(contentTypes[PlatformContentTypeEnum.Collection].displayName).toBe('Collection');
    expect(contentTypes[PlatformContentTypeEnum.HubExecutionEnvironment].displayName).toBe(
      'Execution Environment'
    );
    expect(contentTypes[PlatformContentTypeEnum.Repository].displayName).toBe('Repository');
  });

  it('should include permissions for credential content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const credentialMeta = result.current.content_types[PlatformContentTypeEnum.Credential];

    expect(credentialMeta.permissions['awx.use_credential']).toBe(
      'Can use credential in a job or related resource'
    );
    expect(credentialMeta.permissions['awx.change_credential']).toBe('Can change credential');
    expect(credentialMeta.permissions['awx.delete_credential']).toBe('Can delete credential');
    expect(credentialMeta.permissions['awx.view_credential']).toBe('Can view credential');
  });

  it('should include permissions for organization content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const orgMeta = result.current.content_types[PlatformContentTypeEnum.Organization];

    expect(orgMeta.permissions['shared.member_organization']).toBe('Member organization');
    expect(orgMeta.permissions['shared.change_organization']).toBe('Can change organization');
    expect(orgMeta.permissions['shared.delete_organization']).toBe('Can delete organization');
    expect(orgMeta.permissions['shared.view_organization']).toBe('Can view organization');
  });

  it('should include permissions for inventory content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const invMeta = result.current.content_types[PlatformContentTypeEnum.Inventory];

    expect(invMeta.permissions['awx.use_inventory']).toBe('Can use inventory in a job template');
    expect(invMeta.permissions['awx.adhoc_inventory']).toBe('Can run ad hoc commands');
    expect(invMeta.permissions['awx.update_inventory']).toBe('Can update inventory');
    expect(invMeta.permissions['awx.change_inventory']).toBe('Can change inventory');
    expect(invMeta.permissions['awx.delete_inventory']).toBe('Can delete inventory');
    expect(invMeta.permissions['awx.view_inventory']).toBe('Can view inventory');
  });

  it('should have permissions for System (null) content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const systemMeta = result.current.content_types[PlatformContentTypeEnum.System];

    expect(systemMeta.displayName).toBe('System');
    expect(Object.keys(systemMeta.permissions).length).toBeGreaterThan(0);
    expect(systemMeta.permissions['galaxy.add_ansiblerepository']).toBe(
      'Can add Ansible repository'
    );
  });

  it('should include EDA permissions in Organization content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const orgMeta = result.current.content_types[PlatformContentTypeEnum.Organization];

    expect(orgMeta.permissions['eda.enable_activation']).toBe('Can enable activation');
    expect(orgMeta.permissions['eda.disable_activation']).toBe('Can disable activation');
    expect(orgMeta.permissions['eda.restart_activation']).toBe('Can restart activation');
    expect(orgMeta.permissions['eda.change_activation']).toBe('Can change activation');
  });

  it('should include change activation permission in Activation content type', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const activationMeta = result.current.content_types[PlatformContentTypeEnum.Activation];

    expect(activationMeta.permissions['eda.change_activation']).toBe('Can change activation');
  });

  it('should include hub permissions for containernamespace', () => {
    const { result } = renderHook(() => usePlatformRoleMetadata());
    const eeMeta = result.current.content_types[PlatformContentTypeEnum.HubExecutionEnvironment];

    expect(eeMeta.permissions['galaxy.change_containernamespace']).toBe(
      'Can change container namespace'
    );
    expect(eeMeta.permissions['galaxy.namespace_add_containerdistribution']).toBe(
      'Can push new containers'
    );
  });
});
