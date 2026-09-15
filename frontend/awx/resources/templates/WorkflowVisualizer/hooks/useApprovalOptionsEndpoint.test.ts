import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../../interfaces/OptionsResponse';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import {
  approvalOptionsToPageFormData,
  useApprovalOptionsEndpoint,
} from './useApprovalOptionsEndpoint';

type TopologyNode = { getId: () => string; getData?: () => unknown };

const mockUseWatch = vi.hoisted(() => vi.fn<() => string>(() => RESOURCE_TYPE.workflow_approval));
const mockUseSelectedNode = vi.hoisted(() =>
  vi.fn<() => TopologyNode | undefined>(() => undefined)
);
const mockUseGet = vi.hoisted(() =>
  vi.fn<() => { data: { results: { id: number }[] } | undefined }>(() => ({ data: undefined }))
);
const mockGetState = vi.hoisted(() =>
  vi.fn<
    () => {
      workflowTemplate: { id: number };
      sourceNode?: TopologyNode;
    }
  >(() => ({
    workflowTemplate: { id: 42 },
    sourceNode: undefined,
  }))
);
const mockGetGraph = vi.hoisted(() =>
  vi.fn<() => { getNodes: () => TopologyNode[] }>(() => ({
    getNodes: () => [],
  }))
);

vi.mock('react-hook-form', () => ({
  useWatch: mockUseWatch,
}));

vi.mock('./useSelectedNode', () => ({
  useSelectedNode: mockUseSelectedNode,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: mockUseGet,
}));

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getState: mockGetState,
    getGraph: mockGetGraph,
  }),
}));

describe('useApprovalOptionsEndpoint', () => {
  beforeEach(() => {
    mockUseWatch.mockReturnValue(RESOURCE_TYPE.workflow_approval);
    mockUseSelectedNode.mockReturnValue(undefined);
    mockUseGet.mockReturnValue({ data: undefined });
    mockGetGraph.mockReturnValue({ getNodes: () => [] });
    mockGetState.mockReturnValue({
      workflowTemplate: { id: 42 },
      sourceNode: undefined,
    });
  });

  it('should use workflow_approval_templates detail OPTIONS when editing an existing approval', () => {
    mockUseSelectedNode.mockReturnValue({
      getId: () => '15',
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: {
              id: 7,
              unified_job_type: RESOURCE_TYPE.workflow_approval,
            },
          },
        },
      }),
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBe(awxAPI`/workflow_approval_templates/7/`);
  });

  it('should use create_approval_template OPTIONS when creating an approval on a workflow node', () => {
    mockUseSelectedNode.mockReturnValue({
      getId: () => '15',
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: {
              id: -1,
              unified_job_type: RESOURCE_TYPE.workflow_approval,
            },
          },
        },
      }),
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/15/create_approval_template/`);
  });

  it('should use sourceNode when adding a linked step', () => {
    mockGetState.mockReturnValue({
      workflowTemplate: { id: 42 },
      sourceNode: { getId: () => '33' },
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/33/create_approval_template/`);
  });

  it('should fall back to an existing graph node when no approval template id is set', () => {
    mockGetGraph.mockReturnValue({
      getNodes: () => [{ getId: () => START_NODE_ID }, { getId: () => '22' }],
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/22/create_approval_template/`);
  });

  it('should fall back to workflow template nodes when the graph has no saved nodes', () => {
    mockUseGet.mockReturnValue({ data: { results: [{ id: 99 }] } });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(mockUseGet).toHaveBeenCalledWith(
      awxAPI`/workflow_job_templates/42/workflow_nodes/?page_size=1`
    );
    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/99/create_approval_template/`);
  });

  it('returns undefined when nodeType is not workflow_approval', () => {
    mockUseWatch.mockReturnValue(RESOURCE_TYPE.job);
    mockGetGraph.mockReturnValue({
      getNodes: () => [{ getId: () => START_NODE_ID }, { getId: () => '22' }],
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBeUndefined();
  });

  it('ignores unsaved graph node ids and falls back to workflow template nodes', () => {
    mockGetState.mockReturnValue({
      workflowTemplate: { id: 42 },
      sourceNode: { getId: () => '2-unsavedNode' },
    });
    mockUseGet.mockReturnValue({ data: { results: [{ id: 99 }] } });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(mockUseGet).toHaveBeenCalledWith(
      awxAPI`/workflow_job_templates/42/workflow_nodes/?page_size=1`
    );
    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/99/create_approval_template/`);
  });

  it('returns undefined when only unsaved graph node ids are present', () => {
    mockGetState.mockReturnValue({
      workflowTemplate: { id: 42 },
      sourceNode: { getId: () => '2-unsavedNode' },
    });
    mockGetGraph.mockReturnValue({
      getNodes: () => [{ getId: () => START_NODE_ID }, { getId: () => '1-unsavedNode' }],
    });
    mockUseGet.mockReturnValue({ data: { results: [] } });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when no workflow node or approval template can be resolved', () => {
    mockUseWatch.mockReturnValue(RESOURCE_TYPE.workflow_approval);
    mockUseGet.mockReturnValue({ data: { results: [] } });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBeUndefined();
  });

  it('ignores non-positive approval template ids on the selected node', () => {
    mockUseSelectedNode.mockReturnValue({
      getId: () => '15',
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: {
              id: 0,
              unified_job_type: RESOURCE_TYPE.workflow_approval,
            },
          },
        },
      }),
    });

    const { result } = renderHook(() => useApprovalOptionsEndpoint());

    expect(result.current).toBe(awxAPI`/workflow_job_template_nodes/15/create_approval_template/`);
  });
});

describe('approvalOptionsToPageFormData', () => {
  const nameField: ActionsResponse = {
    type: 'string',
    required: true,
    label: 'Name',
    filterable: true,
    pattern: '^get$',
    pattern_description: 'from GET',
  };
  const getActions: OptionsResponse<ActionsResponse>['actions'] = {
    GET: { name: nameField },
    PUT: {
      name: {
        ...nameField,
        pattern: '^put$',
        pattern_description: 'from PUT',
      },
    },
  };

  it('maps GET onto POST only for create_approval_template', () => {
    const data = approvalOptionsToPageFormData(
      awxAPI`/workflow_job_template_nodes/15/create_approval_template/`,
      { name: 'create approval', description: '', actions: getActions }
    );
    expect(data).toEqual({
      actions: { POST: getActions.GET },
    });
  });

  it('passes through OPTIONS for workflow_approval_templates detail', () => {
    const options: OptionsResponse<ActionsResponse> = {
      name: 'approval template',
      description: '',
      actions: getActions,
    };
    expect(approvalOptionsToPageFormData(awxAPI`/workflow_approval_templates/7/`, options)).toBe(
      options
    );
  });

  it('returns undefined when options response is undefined', () => {
    expect(
      approvalOptionsToPageFormData(
        awxAPI`/workflow_job_template_nodes/15/create_approval_template/`,
        undefined
      )
    ).toBeUndefined();
  });
});
