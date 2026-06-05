import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus } from '../types';

vi.mock('@patternfly/react-topology', () => ({
  Edge: {},
  EdgeModel: {},
  ElementModel: {},
  GraphElement: {},
  Node: {},
  NodeModel: {},
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
  WithSelectionProps: {},
  useVisualizationController: vi.fn(() => ({
    getState: () => ({}),
    setState: () => {},
    getGraph: () => ({ getNodes: () => [], layout: () => {} }),
    getElements: () => [],
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const { getLaunchData, useNodeTypeStepDefaults } = await import('./useGetInitialValues');

const server = setupServer(
  http.get(awxAPI`/job_templates/1/launch/`, () =>
    HttpResponse.json({
      ask_credential_on_launch: true,
      ask_inventory_on_launch: false,
      survey_enabled: false,
    })
  ),
  http.get(awxAPI`/workflow_job_templates/2/launch/`, () =>
    HttpResponse.json({
      ask_inventory_on_launch: true,
      survey_enabled: false,
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeGraphNode(overrides: Record<string, unknown> = {}) {
  return {
    getData: () => ({
      resource: {
        identifier: 'my-alias',
        all_parents_must_converge: true,
        extra_data: { days: 14 },
        summary_fields: {
          unified_job_template: {
            id: 1,
            name: 'Demo Job Template',
            description: 'A description',
            unified_job_type: RESOURCE_TYPE.job,
            timeout: 120,
            ...overrides,
          },
        },
      },
    }),
  } as never;
}

describe('useNodeTypeStepDefaults', () => {
  it('should return default mapper values when node is undefined', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const defaults = result.current(undefined);

    expect(defaults.node_type).toBe(RESOURCE_TYPE.job);
    expect(defaults.node_convergence).toBe('any');
    expect(defaults.node_alias).toBe('');
    expect(defaults.approval_name).toBe('');
    expect(defaults.approval_description).toBe('');
    expect(defaults.approval_timeout).toBe(0);
    expect(defaults.node_days_to_keep).toBe(30);
    expect(defaults.resource).toBeNull();
    expect(defaults.resourceId).toBeUndefined();
    expect(defaults.node_status_type).toBe(EdgeStatus.info);
  });

  it('should return values from node data for a job template node', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode();
    const defaults = result.current(node);

    expect(defaults.node_type).toBe(RESOURCE_TYPE.job);
    expect(defaults.node_convergence).toBe('all');
    expect(defaults.node_alias).toBe('my-alias');
    expect(defaults.node_days_to_keep).toBe(14);
    expect(defaults.resourceId).toBe(1);
    expect(defaults.approval_timeout).toBe(120);
  });

  it('should return approval name for workflow_approval node type', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode({
      unified_job_type: RESOURCE_TYPE.workflow_approval,
      name: 'Approve Me',
    });
    const defaults = result.current(node);

    expect(defaults.approval_name).toBe('Approve Me');
    expect(defaults.node_type).toBe(RESOURCE_TYPE.workflow_approval);
  });

  it('should return empty approval_name for non-approval node types', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode({ unified_job_type: RESOURCE_TYPE.job, name: 'My Template' });
    const defaults = result.current(node);

    expect(defaults.approval_name).toBe('');
  });

  it('should return empty alias when identifier is a UUID', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const uuidNode = {
      getData: () => ({
        resource: {
          identifier: '550e8400-e29b-41d4-a716-446655440000',
          all_parents_must_converge: null,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const defaults = result.current(uuidNode);
    expect(defaults.node_alias).toBe('');
    expect(defaults.node_convergence).toBe('any');
  });
});

describe('getLaunchData', () => {
  it('should return launch config for a job template node', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.job, id: 1 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result?.ask_credential_on_launch).toBe(true);
    expect(result?.ask_inventory_on_launch).toBe(false);
  });

  it('should return launch config for a workflow job template node', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.workflow_job, id: 2 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result?.ask_inventory_on_launch).toBe(true);
  });

  it('should return undefined when there is no unified_job_template', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {},
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-promptable node types like project_update', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.project_update, id: 3 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result).toBeUndefined();
  });
});
