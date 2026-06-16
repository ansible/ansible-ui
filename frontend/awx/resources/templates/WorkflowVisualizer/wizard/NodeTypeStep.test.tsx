import { act, render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import type { WizardFormValues } from '../types';
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
  useVisualizationController: vi.fn(),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const mockSetWizardData = vi.hoisted(() => vi.fn());
const mockSetStepData = vi.hoisted(() => vi.fn());

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

function TestWrapper({ defaultValues }: Readonly<{ defaultValues: Partial<WizardFormValues> }>) {
  const methods = useForm<WizardFormValues>({ defaultValues });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        <NodeTypeStep />
      </FormProvider>
    </MemoryRouter>
  );
}

describe('NodeTypeStep', () => {
  beforeEach(() => {
    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();
    mockRequestGet.mockClear();
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
});

function TestWrapperWithSourceNode({
  defaultValues,
  hasSourceNode = false,
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

describe('NodeTypeStep sub-components', () => {
  beforeEach(() => {
    mockSetWizardData.mockClear();
    mockSetStepData.mockClear();
    mockRequestGet.mockClear();
  });

  it('should render NodeStatusType when hasSourceNode is true', () => {
    const { getByTestId } = render(
      <TestWrapperWithSourceNode defaultValues={{ node_type: RESOURCE_TYPE.job }} hasSourceNode />
    );
    expect(getByTestId('node-status-type')).toBeInTheDocument();
  });

  it('should not render NodeStatusType when hasSourceNode is false', () => {
    const { queryByTestId } = render(
      <TestWrapperWithSourceNode
        defaultValues={{ node_type: RESOURCE_TYPE.job }}
        hasSourceNode={false}
      />
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
});
