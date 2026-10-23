import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import type { WizardFormValues } from '../types';
import { awaitLaunchConfigLoad } from './launchConfigLoad';
import { NodeTypeStep } from './NodeTypeStep';

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
    getState: () => ({ workflowTemplate: { id: 1 }, sourceNode: undefined }),
    getGraph: () => ({ getNodes: () => [] }),
    getNodeById: () => undefined,
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const mockSetWizardData = vi.hoisted(() => vi.fn());
const mockStepState = {
  nodePromptsStep: {
    prompt: {
      credentials: [],
      labels: [],
      instance_groups: [],
      skip_tags: [],
      job_tags: [],
      extra_vars: '',
      inventory: null,
    },
  },
};
const mockSetStepData = vi.hoisted(() =>
  vi.fn((updater: unknown) => {
    if (typeof updater === 'function') {
      (updater as (prev: typeof mockStepState) => typeof mockStepState)(mockStepState);
    }
  })
);
const mockUseOptions = vi.hoisted(() =>
  vi.fn<(url?: string) => { data: unknown }>(() => ({ data: undefined }))
);
const mockUseApprovalOptionsEndpoint = vi.hoisted(() =>
  vi.fn<() => string | undefined>(() => undefined)
);

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    setWizardData: mockSetWizardData,
    setStepData: mockSetStepData,
    wizardData: {},
    stepData: {},
    activeStep: { id: 'nodeTypeStep' },
  }),
}));

vi.mock('../../../../common/useAwxConfig', () => ({
  useAwxConfig: vi.fn(() => null),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(() => ({ data: undefined })),
  useGetItem: vi.fn(() => ({ data: undefined })),
}));

vi.mock('../hooks/useApprovalOptionsEndpoint', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useApprovalOptionsEndpoint')>();
  return {
    ...actual,
    useApprovalOptionsEndpoint: mockUseApprovalOptionsEndpoint,
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: mockUseOptions,
}));

vi.mock('@ansible/hub-ui/common/ExternalLink', () => ({
  ExternalLink: ({ children }: Readonly<{ children: React.ReactNode }>) => <span>{children}</span>,
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: vi.fn(() => 'https://docs.example.com'),
}));

const mockRequestGet = vi.hoisted(() =>
  vi.fn((url: string): Promise<Record<string, unknown>> => {
    if (url.includes('/launch/')) {
      return Promise.resolve({
        ask_credential_on_launch: true,
        ask_inventory_on_launch: true,
        ask_variables_on_launch: false,
        survey_enabled: false,
        defaults: { credentials: [], inventory: null },
      });
    }
    if (url.includes('/credentials/')) {
      return Promise.resolve({
        count: 1,
        results: [
          {
            id: 10,
            name: 'SSH Key',
            credential_type: 1,
            summary_fields: { credential_type: { name: 'Machine' } },
          },
        ],
      });
    }
    return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
  })
);

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: mockRequestGet,
}));

function TestWrapper({
  defaultValues,
  hasSourceNode,
}: Readonly<{ defaultValues: Partial<WizardFormValues>; hasSourceNode?: boolean }>) {
  const methods = useForm<WizardFormValues>({ defaultValues });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        <NodeTypeStep hasSourceNode={hasSourceNode} />
      </FormProvider>
    </MemoryRouter>
  );
}

describe('NodeTypeStep', () => {
  beforeEach(() => {
    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();
    mockRequestGet.mockClear();
    mockUseOptions.mockReturnValue({ data: undefined });
    mockUseApprovalOptionsEndpoint.mockReturnValue(undefined);
  });

  it('should call setWizardData with launch_config when a job template resourceId is set', async () => {
    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
          resourceId: 1,
        }}
      />
    );

    await waitFor(
      () => {
        expect(mockSetWizardData).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );

    const wizardDataArg: unknown = mockSetWizardData.mock.calls[0][0];
    if (typeof wizardDataArg === 'function') {
      const result = (wizardDataArg as (prev: Record<string, unknown>) => Record<string, unknown>)(
        {}
      );
      expect(result).toHaveProperty('resourceId', 1);
    } else {
      expect(wizardDataArg).toBeDefined();
    }
  });

  it('should call setStepData with prompt values when launch config has prompts', async () => {
    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
          resourceId: 1,
        }}
      />
    );

    await waitFor(
      () => {
        expect(mockSetStepData).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });

  it('should call setWizardData with null launch_config when template has no promptable fields', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: false,
          ask_inventory_on_launch: false,
          ask_variables_on_launch: false,
          survey_enabled: false,
          defaults: {},
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 2, name: 'Simple Template', type: 'job_template' });
    });

    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
          resourceId: 2,
        }}
      />
    );

    await waitFor(
      () => {
        expect(mockSetWizardData).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );

    const wizardDataArg: unknown = mockSetWizardData.mock.calls[0][0];
    if (typeof wizardDataArg === 'function') {
      const result = (wizardDataArg as (prev: Record<string, unknown>) => Record<string, unknown>)(
        {}
      );
      expect(result.launch_config).toBeNull();
    }
  });

  it('should early-return and not call setWizardData when resourceId is undefined', async () => {
    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
          resourceId: undefined,
        }}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(mockSetWizardData).not.toHaveBeenCalled();
  });

  it('should not call setLaunchToWizardData for workflow_approval node type', async () => {
    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.workflow_approval,
          resourceId: undefined,
        }}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(mockRequestGet).not.toHaveBeenCalled();
  });

  it('should reset prompt step data when template changes (isTemplateChange = true)', async () => {
    // Use a controlled wrapper that can change resourceId via setValue to trigger isTemplateChange
    function ControlledWrapper() {
      const [nextId, setNextId] = useState<number | undefined>(undefined);
      const methods = useForm<WizardFormValues>({
        defaultValues: { node_type: RESOURCE_TYPE.job, resourceId: 1 },
      });

      useEffect(() => {
        if (nextId !== undefined) {
          methods.setValue('resourceId', nextId);
        }
      }, [nextId, methods]);

      return (
        <MemoryRouter>
          <FormProvider {...methods}>
            <NodeTypeStep />
            <button onClick={() => setNextId(2)}>Switch</button>
          </FormProvider>
        </MemoryRouter>
      );
    }

    const { getByRole } = render(<ControlledWrapper />);

    await waitFor(() => expect(mockSetWizardData).toHaveBeenCalled(), { timeout: 5000 });

    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();

    act(() => {
      getByRole('button', { name: 'Switch' }).click();
    });

    await waitFor(() => expect(mockSetWizardData).toHaveBeenCalled(), { timeout: 5000 });
    expect(mockSetStepData).toHaveBeenCalled();
  });

  it('should clear prompt step state when switching to a template with no promptable fields (else-if isTemplateChange path)', async () => {
    // Override mock: template 1 has prompts, template 3 has NO prompts
    // When switching from 1→3 with isTemplateChange=true and shouldShowPromptStep=false,
    // lines 238-254 (the else-if isTemplateChange cleanup path) should be covered.
    // fetchResource builds URLs with a trailing slash, producing double slashes like
    // /job_templates//3/launch/. Match resource ID suffix to handle both /3/ and //3/ patterns.
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('3/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: false,
          ask_inventory_on_launch: false,
          ask_variables_on_launch: false,
          ask_labels_on_launch: false,
          ask_instance_groups_on_launch: false,
          ask_tags_on_launch: false,
          ask_skip_tags_on_launch: false,
          ask_diff_mode_on_launch: false,
          ask_limit_on_launch: false,
          ask_verbosity_on_launch: false,
          ask_scm_branch_on_launch: false,
          ask_forks_on_launch: false,
          ask_job_slice_count_on_launch: false,
          ask_timeout_on_launch: false,
          ask_execution_environment_on_launch: false,
          ask_job_type_on_launch: false,
          survey_enabled: false,
          defaults: {},
        });
      }
      if (url.includes('3/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      // fetchResource for template 3: endsWith //3 or /3 (must come AFTER launch/ and credentials/ checks)
      if (url.endsWith('//3') || url.endsWith('/3')) {
        return Promise.resolve({ id: 3, name: 'No-Prompts Template', type: 'job_template' });
      }
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_inventory_on_launch: true,
          ask_variables_on_launch: false,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({
          count: 1,
          results: [
            {
              id: 10,
              name: 'SSH',
              credential_type: 1,
              summary_fields: { credential_type: { name: 'Machine' } },
            },
          ],
        });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    function ControlledWrapper() {
      const [nextId, setNextId] = useState<number | undefined>(undefined);
      const methods = useForm<WizardFormValues>({
        defaultValues: { node_type: RESOURCE_TYPE.job, resourceId: 1 },
      });

      useEffect(() => {
        if (nextId !== undefined) {
          methods.setValue('resourceId', nextId);
        }
      }, [nextId, methods]);

      return (
        <MemoryRouter>
          <FormProvider {...methods}>
            <NodeTypeStep />
            <button onClick={() => setNextId(3)}>Switch to no-prompts</button>
          </FormProvider>
        </MemoryRouter>
      );
    }

    const { getByRole } = render(<ControlledWrapper />);

    await waitFor(() => expect(mockSetWizardData).toHaveBeenCalled(), { timeout: 5000 });
    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();

    act(() => {
      getByRole('button', { name: 'Switch to no-prompts' }).click();
    });

    await waitFor(
      () => {
        expect(mockSetWizardData).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
    expect(mockSetStepData).toHaveBeenCalled();

    const wizardDataArg: unknown = mockSetWizardData.mock.calls[0][0];
    if (typeof wizardDataArg === 'function') {
      const result = (wizardDataArg as (prev: Record<string, unknown>) => Record<string, unknown>)(
        {}
      );
      expect(result.launch_config).toBeNull();
    }
  });

  it('should handle workflow_job template type and fetch launch config', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/workflow_job_templates/10/launch/')) {
        return Promise.resolve({
          ask_inventory_on_launch: true,
          ask_credential_on_launch: false,
          survey_enabled: false,
          defaults: {},
        });
      }
      return Promise.resolve({ id: 10, name: 'WF Template', type: 'workflow_job_template' });
    });

    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.workflow_job,
          resourceId: 10,
        }}
      />
    );

    await waitFor(() => expect(mockSetWizardData).toHaveBeenCalled(), { timeout: 5000 });
    expect(mockRequestGet).toHaveBeenCalledWith(
      expect.stringContaining('/workflow_job_templates/10/launch/')
    );
  });

  it('should render the node type selector form elements', () => {
    const { container } = render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
        }}
      />
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('should preserve empty scm_branch from step data over launch config default when template has not changed', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_scm_branch_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, scm_branch: 'test' },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    // Simulate step state where scm_branch = '' (node override cleared, resolvePromptField returns '')
    const stepStateWithClearedBranch = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, scm_branch: '' },
      },
    };

    let capturedPrompt: unknown;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithClearedBranch) => {
            nodePromptsStep?: { prompt?: unknown };
          }
        )(stepStateWithClearedBranch);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt).toMatchObject({ scm_branch: '' });
  });

  it('should use launch config scm_branch as fallback when step data has no scm_branch override', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_scm_branch_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, scm_branch: 'release' },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    // Step state without scm_branch — prompts?.scm_branch is undefined, so fallback to launchConfigValue
    const stepStateWithoutBranch = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt },
      },
    };

    let capturedPrompt: unknown;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithoutBranch) => {
            nodePromptsStep?: { prompt?: unknown };
          }
        )(stepStateWithoutBranch);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt).toMatchObject({ scm_branch: 'release' });
  });

  it('should not duplicate labels when step data and launch config defaults share the same label', async () => {
    const nodeLabel = { id: 1, name: 'JAK' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_labels_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, labels: [nodeLabel] },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithNodeLabels = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, labels: [nodeLabel] },
      },
    };

    let capturedPrompt: { labels?: { id: number; name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithNodeLabels) => {
            nodePromptsStep?: { prompt?: { labels?: { id: number; name: string }[] } };
          }
        )(stepStateWithNodeLabels);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.labels).toEqual([nodeLabel]);
    expect(capturedPrompt?.labels).toHaveLength(1);
  });

  it('should use launch config labels as fallback when step data has no labels override', async () => {
    const templateLabel = { id: 2, name: 'prod' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_labels_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, labels: [templateLabel] },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithoutLabelOverride = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, labels: undefined },
      },
    };

    let capturedPrompt: unknown;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithoutLabelOverride) => {
            nodePromptsStep?: { prompt?: unknown };
          }
        )(stepStateWithoutLabelOverride);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt).toMatchObject({ labels: [templateLabel] });
  });

  it('should default labels to an empty array when step and launch config provide none', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_labels_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithoutLabelOverride = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, labels: undefined },
      },
    };

    let capturedPrompt: { labels?: { id: number; name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithoutLabelOverride) => {
            nodePromptsStep?: { prompt?: { labels?: { id: number; name: string }[] } };
          }
        )(stepStateWithoutLabelOverride);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.labels).toEqual([]);
  });

  it('should keep empty step labels instead of falling back to launch config defaults', async () => {
    const templateLabel = { id: 2, name: 'prod' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_labels_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, labels: [templateLabel] },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithEmptyLabels = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, labels: [] },
      },
    };

    let capturedPrompt: { labels?: { id: number; name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithEmptyLabels) => {
            nodePromptsStep?: { prompt?: { labels?: { id: number; name: string }[] } };
          }
        )(stepStateWithEmptyLabels);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.labels).toEqual([]);
  });

  it('should use launch config labels when step prompt state is missing', async () => {
    const templateLabel = { id: 3, name: 'stage' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_labels_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, labels: [templateLabel] },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    let capturedPrompt: unknown;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: Record<string, unknown>) => {
            nodePromptsStep?: { prompt?: unknown };
          }
        )({});
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt).toMatchObject({ labels: [templateLabel] });
  });

  it('should not duplicate job_tags when step data and launch config defaults share the same tag', async () => {
    const tag = { name: 'deploy', label: 'deploy', value: 'deploy' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_tags_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null, job_tags: 'deploy' },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithTags = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, job_tags: [tag] },
      },
    };

    let capturedPrompt: { job_tags?: { name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithTags) => {
            nodePromptsStep?: { prompt?: { job_tags?: { name: string }[] } };
          }
        )(stepStateWithTags);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.job_tags).toHaveLength(1);
    expect(capturedPrompt?.job_tags?.[0]?.name).toBe('deploy');
  });

  it('should not duplicate job_tags or skip_tags when step data already has the same template tags', async () => {
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_tags_on_launch: true,
          ask_skip_tags_on_launch: true,
          survey_enabled: false,
          defaults: {
            credentials: [],
            inventory: null,
            job_tags: 'deploy,build',
            skip_tags: 'skip1',
          },
        });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const existingJobTags = [{ name: 'deploy' }, { name: 'build' }];
    const existingSkipTags = [{ name: 'skip1' }];
    const stepStateWithTags = {
      nodePromptsStep: {
        prompt: {
          ...mockStepState.nodePromptsStep.prompt,
          job_tags: existingJobTags,
          skip_tags: existingSkipTags,
        },
      },
    };

    let capturedPrompt: { job_tags?: { name: string }[]; skip_tags?: { name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithTags) => {
            nodePromptsStep?: { prompt?: typeof capturedPrompt };
          }
        )(stepStateWithTags);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.job_tags).toEqual(existingJobTags);
    expect(capturedPrompt?.skip_tags).toEqual(existingSkipTags);
    expect(capturedPrompt?.job_tags).toHaveLength(2);
    expect(capturedPrompt?.skip_tags).toHaveLength(1);
  });

  it('should show launch config instance groups when step instance groups are empty', async () => {
    const defaultIg = { id: 10, name: 'default-ig' };
    mockRequestGet.mockImplementation((url: string): Promise<Record<string, unknown>> => {
      if (url.includes('/launch/')) {
        return Promise.resolve({
          ask_credential_on_launch: true,
          ask_instance_groups_on_launch: true,
          survey_enabled: false,
          defaults: { credentials: [], inventory: null },
        });
      }
      if (url.includes('/job_templates/') && url.includes('/instance_groups/')) {
        return Promise.resolve({ count: 1, results: [defaultIg] });
      }
      if (url.includes('/credentials/')) {
        return Promise.resolve({ count: 0, results: [] });
      }
      return Promise.resolve({ id: 1, name: 'Demo Template', type: 'job_template' });
    });

    const stepStateWithEmptyIgs = {
      nodePromptsStep: {
        prompt: { ...mockStepState.nodePromptsStep.prompt, instance_groups: [] },
      },
    };

    let capturedPrompt: { instance_groups?: { id: number; name: string }[] } | undefined;
    mockSetStepData.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        const result = (
          updater as (prev: typeof stepStateWithEmptyIgs) => {
            nodePromptsStep?: { prompt?: { instance_groups?: { id: number; name: string }[] } };
          }
        )(stepStateWithEmptyIgs);
        capturedPrompt = result?.nodePromptsStep?.prompt;
      }
    });

    render(<TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, resourceId: 1 }} />);

    await waitFor(() => expect(mockSetStepData).toHaveBeenCalled(), { timeout: 5000 });

    expect(capturedPrompt?.instance_groups).toEqual([defaultIg]);
  });

  it('registers launch config loads that can be awaited during wizard validation', async () => {
    render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.job,
          resourceId: 1,
        }}
      />
    );

    await waitFor(async () => {
      const loadResult = await awaitLaunchConfigLoad(RESOURCE_TYPE.job, 1);
      expect(loadResult).toBeDefined();
      expect(loadResult?.resourceId).toBe(1);
      expect(loadResult?.resource).toMatchObject({ id: 1 });
    });
  });
});

describe('NodeTypeStep sub-components', () => {
  beforeEach(() => {
    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();
    mockRequestGet.mockClear();
    mockUseOptions.mockReturnValue({ data: undefined });
    mockUseApprovalOptionsEndpoint.mockReturnValue(undefined);
  });

  it('should render NodeStatusType when hasSourceNode is true', () => {
    const { getByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} hasSourceNode />
    );
    expect(getByTestId('node-status-type')).toBeInTheDocument();
  });

  it('should not render NodeStatusType when hasSourceNode is false', () => {
    const { queryByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} hasSourceNode={false} />
    );
    expect(queryByTestId('node-status-type')).not.toBeInTheDocument();
  });

  it('should render convergence input', () => {
    const { getByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} />
    );
    expect(getByTestId('node-convergence')).toBeInTheDocument();
  });

  it('should render alias input', () => {
    const { getByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} />
    );
    expect(getByTestId('node-alias')).toBeInTheDocument();
  });

  it('should render approval form fields for workflow_approval node type', () => {
    const { getByTestId } = render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.workflow_approval,
          approval_timeout: 90,
        }}
      />
    );
    expect(getByTestId('approval_timeout_minutes')).toBeInTheDocument();
    expect(getByTestId('approval_timeout_seconds')).toBeInTheDocument();
  });

  it('should render node type select', () => {
    const { getByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} />
    );
    expect(getByTestId('node-type')).toBeInTheDocument();
  });

  it('should render node status type when hasSourceNode is true', () => {
    const { getByTestId } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job }} hasSourceNode />
    );
    expect(getByTestId('node-status-type')).toBeInTheDocument();
  });

  it('should use workflow node OPTIONS metadata for alias validation', async () => {
    const user = userEvent.setup();
    mockUseOptions.mockImplementation((url?: string) => {
      if (url?.includes('/workflow_job_template_nodes/')) {
        return {
          data: {
            actions: {
              POST: {
                identifier: {
                  pattern: '^[a-z0-9-]+$',
                  pattern_description: 'Alias pattern',
                },
              },
            },
          },
        };
      }
      return { data: undefined };
    });

    const { getByTestId, getByText } = render(
      <TestWrapper defaultValues={{ node_type: RESOURCE_TYPE.job, node_alias: 'x' }} />
    );
    expect(getByTestId('node-alias')).toBeInTheDocument();

    const aliasInput = getByTestId('node-alias');
    await user.clear(aliasInput);
    await user.type(aliasInput, 'INVALID');
    await user.tab();

    await waitFor(() => {
      expect(getByText('Alias pattern')).toBeInTheDocument();
    });
  });

  it('should use approval OPTIONS metadata when creating an approval node', async () => {
    const user = userEvent.setup();
    mockUseApprovalOptionsEndpoint.mockReturnValue(
      '/api/controller/v2/workflow_job_template_nodes/15/create_approval_template/'
    );
    mockUseOptions.mockImplementation((url?: string) => {
      if (url?.includes('/create_approval_template/')) {
        return {
          data: {
            actions: {
              GET: {
                name: {
                  pattern: '^[a-z]+$',
                  pattern_description: 'Approval name pattern',
                },
              },
            },
          },
        };
      }
      return { data: undefined };
    });

    const { getByLabelText, getByText } = render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.workflow_approval,
          approval_timeout: 90,
          approval_name: '',
        }}
      />
    );

    const nameInput = getByLabelText(/^Name/);
    await user.type(nameInput, 'INVALID');
    await user.tab();

    await waitFor(() => {
      expect(getByText('Approval name pattern')).toBeInTheDocument();
    });
  });

  it('should fall back to job template OPTIONS for approval fields when no endpoint is resolved', async () => {
    const user = userEvent.setup();
    mockUseOptions.mockImplementation((url?: string) => {
      if (url?.includes('/job_templates/')) {
        return {
          data: {
            actions: {
              POST: {
                name: {
                  pattern: '^[a-z]+$',
                  pattern_description: 'Fallback name pattern',
                },
                description: {
                  pattern: '^[a-z ]+$',
                  pattern_description: 'Fallback description pattern',
                },
              },
            },
          },
        };
      }
      return { data: undefined };
    });

    const { getByLabelText, getByText } = render(
      <TestWrapper
        defaultValues={{
          node_type: RESOURCE_TYPE.workflow_approval,
          approval_timeout: 0,
          approval_name: '',
        }}
      />
    );
    expect(mockUseOptions).toHaveBeenCalledWith(expect.stringContaining('/job_templates/'));

    const nameInput = getByLabelText(/^Name/);
    await user.type(nameInput, 'INVALID');
    await user.tab();

    await waitFor(() => {
      expect(getByText('Fallback name pattern')).toBeInTheDocument();
    });
  });
});
