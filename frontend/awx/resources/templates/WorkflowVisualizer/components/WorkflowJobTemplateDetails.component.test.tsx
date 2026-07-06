import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import type { GraphNodeData } from '../types';
import { WorkflowJobTemplateDetails } from './WorkflowJobTemplateDetails';

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

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(() => ({ data: undefined })),
}));

import { useGet } from '@ansible/common-ui/crud/useGet';

const mockTemplate = {
  id: 1,
  name: 'Test WF Template',
  description: 'Workflow template description',
  type: 'workflow_job_template' as const,
  organization: 1,
  inventory: 1,
  allow_simultaneous: false,
  webhook_service: 'github',
  webhook_credential: 1,
  skip_tags: 'skip_a,skip_b',
  job_tags: 'deploy,build',
  extra_vars: 'base_var: hello',
  scm_branch: 'main',
  limit: 'all-hosts',
  related: {
    webhook_key: '/api/v2/workflow_job_templates/1/webhook_key/',
    webhook_receiver: '/api/v2/workflow_job_templates/1/github/',
    labels: '/api/v2/workflow_job_templates/1/labels/',
    launch: '/api/v2/workflow_job_templates/1/launch/',
    schedules: '',
    survey_spec: '',
  },
  summary_fields: {
    organization: { id: 1, name: 'Test Organization', description: '' },
    inventory: {
      id: 1,
      name: 'Default Inventory',
      description: '',
      has_active_failures: false,
      total_hosts: 5,
      hosts_with_active_failures: 0,
      total_groups: 1,
      has_inventory_sources: false,
      total_inventory_sources: 0,
      inventory_sources_with_failures: 0,
      organization_id: 1,
      kind: '' as const,
    },
    labels: {
      count: 1,
      results: [{ id: 1, name: 'production' }],
    },
    webhook_credential: {
      id: 1,
      name: 'GitHub Token',
      description: 'Webhook credential',
      kind: 'token',
      cloud: false,
    },
  },
} as unknown as WorkflowJobTemplate;

const mockNodeData: GraphNodeData = {
  resource: {
    id: 1,
    identifier: 'node-1',
    scm_branch: null,
    limit: null,
    job_tags: null,
    skip_tags: null,
    extra_data: {},
    all_parents_must_converge: false,
    success_nodes: [],
    failure_nodes: [],
    always_nodes: [],
    related: {
      labels: '/api/v2/workflow_job_template_nodes/1/labels/',
      credentials: '',
      instance_groups: '',
    },
    summary_fields: {
      unified_job_template: {
        id: 1,
        name: 'Test WF Template',
        unified_job_type: 'workflow_job',
      },
      inventory: { id: 1, name: 'Default Inventory' },
    },
  } as never,
  launch_data: undefined as never,
  survey_data: undefined as never,
};

function renderComponent(
  template: WorkflowJobTemplate = mockTemplate,
  node: GraphNodeData = mockNodeData
) {
  return render(
    <MemoryRouter>
      <WorkflowJobTemplateDetails template={template} node={node} />
    </MemoryRouter>
  );
}

function mockUseGetWithLaunchConfig(config: Partial<LaunchConfiguration>) {
  vi.mocked(useGet).mockImplementation((url) => {
    if (typeof url === 'string' && url.includes('/launch')) {
      return {
        data: config as LaunchConfiguration,
        error: undefined,
        refresh: vi.fn(),
        isLoading: false,
      };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: false };
  });
}

describe('WorkflowJobTemplateDetails', () => {
  beforeEach(() => {
    vi.mocked(useGet).mockReturnValue({
      data: undefined,
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });
  });

  it('should render organization name from template', () => {
    renderComponent();
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should render inventory name from template', () => {
    renderComponent();
    expect(screen.getByText('Default Inventory')).toBeInTheDocument();
  });

  it('should render source control branch from template', () => {
    renderComponent();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('should render limit from template', () => {
    renderComponent();
    expect(screen.getByText('all-hosts')).toBeInTheDocument();
  });

  it('should render webhook service when set', () => {
    renderComponent();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('should render webhook URL and key when webhook key data is available', () => {
    vi.mocked(useGet).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('webhook_key')) {
        return {
          data: { webhook_key: 'secret-key-123' },
          error: undefined,
          refresh: vi.fn(),
          isLoading: false,
        };
      }
      return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: false };
    });

    renderComponent();
    expect(screen.getByText(/\/api\/v2\/workflow_job_templates\/1\/github\//)).toBeInTheDocument();
    expect(screen.getByText('secret-key-123')).toBeInTheDocument();
  });

  it('should not render webhook URL and key labels when webhook key is unavailable', () => {
    renderComponent();
    expect(screen.queryByText('Webhook URL')).not.toBeInTheDocument();
    expect(screen.queryByText('Webhook key')).not.toBeInTheDocument();
  });

  it('should render webhook credential section when present', () => {
    renderComponent();
    expect(screen.getByText('Webhook credential')).toBeInTheDocument();
  });

  it('should not render webhook credential section when absent', () => {
    const templateNoCred = {
      ...mockTemplate,
      summary_fields: {
        ...mockTemplate.summary_fields,
        webhook_credential: undefined,
      },
    } as unknown as WorkflowJobTemplate;

    renderComponent(templateNoCred);
    expect(screen.queryByText('Webhook credential')).not.toBeInTheDocument();
  });

  it('should render concurrent jobs option when allow_simultaneous is true', () => {
    const templateConcurrent = {
      ...mockTemplate,
      allow_simultaneous: true,
    } as unknown as WorkflowJobTemplate;

    renderComponent(templateConcurrent);
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
  });

  it('should render webhooks option when webhook_service is set', () => {
    renderComponent();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });

  it('should not render enabled options when both are disabled', () => {
    const templateNoOpts = {
      ...mockTemplate,
      allow_simultaneous: false,
      webhook_service: '',
    } as unknown as WorkflowJobTemplate;

    renderComponent(templateNoOpts);
    expect(screen.queryByText('Concurrent jobs')).not.toBeInTheDocument();
    expect(screen.queryByText('Webhooks')).not.toBeInTheDocument();
  });

  it('should render labels from template when ask_labels_on_launch is false', () => {
    renderComponent();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('should render labels from prompt values when ask_labels_on_launch is true', () => {
    mockUseGetWithLaunchConfig({ ask_labels_on_launch: true });

    const nodeWithLabels: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        labels: [
          { name: 'staging', id: 10 },
          { name: 'v2', id: 11 },
        ],
      },
    };

    renderComponent(mockTemplate, nodeWithLabels);
    expect(screen.getByText('staging')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('should render labels from node labels when ask_labels_on_launch is true and no prompt labels', () => {
    vi.mocked(useGet).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/launch')) {
        return {
          data: { ask_labels_on_launch: true } as Partial<LaunchConfiguration>,
          error: undefined,
          refresh: vi.fn(),
          isLoading: false,
        };
      }
      if (typeof url === 'string' && url.includes('/labels')) {
        return {
          data: { count: 1, results: [{ id: 20, name: 'node-label' }] },
          error: undefined,
          refresh: vi.fn(),
          isLoading: false,
        };
      }
      return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: false };
    });

    renderComponent();
    expect(screen.getByText('node-label')).toBeInTheDocument();
  });

  it('should render job tags from template when ask_tags_on_launch is false', () => {
    renderComponent();
    expect(screen.getByText('deploy')).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
  });

  it('should render job tags from prompt when ask_tags_on_launch is true', () => {
    mockUseGetWithLaunchConfig({ ask_tags_on_launch: true });

    const nodeWithTags: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        job_tags: [{ name: 'prompt-tag' }],
      },
    };

    renderComponent(mockTemplate, nodeWithTags);
    expect(screen.getByText('prompt-tag')).toBeInTheDocument();
  });

  it('should render job tags from node when ask_tags_on_launch is true and no prompt tags', () => {
    mockUseGetWithLaunchConfig({ ask_tags_on_launch: true });

    const nodeWithJobTags: GraphNodeData = {
      ...mockNodeData,
      resource: {
        ...mockNodeData.resource,
        job_tags: 'node-tag-1,node-tag-2',
      } as never,
    };

    renderComponent(mockTemplate, nodeWithJobTags);
    expect(screen.getByText('node-tag-1')).toBeInTheDocument();
    expect(screen.getByText('node-tag-2')).toBeInTheDocument();
  });

  it('should render skip tags from template when ask_skip_tags_on_launch is false', () => {
    renderComponent();
    expect(screen.getByText('skip_a')).toBeInTheDocument();
    expect(screen.getByText('skip_b')).toBeInTheDocument();
  });

  it('should render skip tags from prompt when ask_skip_tags_on_launch is true', () => {
    mockUseGetWithLaunchConfig({ ask_skip_tags_on_launch: true });

    const nodeWithSkipTags: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        skip_tags: [{ name: 'skip-prompt' }],
      },
    };

    renderComponent(mockTemplate, nodeWithSkipTags);
    expect(screen.getByText('skip-prompt')).toBeInTheDocument();
  });

  it('should render variables from node extra_data', () => {
    const nodeWithVars: GraphNodeData = {
      ...mockNodeData,
      resource: {
        ...mockNodeData.resource,
        extra_data: { my_key: 'my_value' },
      } as never,
    };

    renderComponent(mockTemplate, nodeWithVars);
    expect(screen.getByText('Variables')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-value')).toHaveTextContent('my_key: my_value');
  });

  it('should merge survey data into variables', () => {
    const nodeWithSurvey: GraphNodeData = {
      ...mockNodeData,
      resource: {
        ...mockNodeData.resource,
        extra_data: { existing_key: 'existing_value' },
      } as never,
      survey_data: { survey_key: 'survey_value' },
    };

    renderComponent(mockTemplate, nodeWithSurvey);
    expect(screen.getByTestId('code-block-value')).toHaveTextContent('survey_key: survey_value');
    expect(screen.getByTestId('code-block-value')).toHaveTextContent(
      'existing_key: existing_value'
    );
  });

  it('should render inventory from prompt data when available', () => {
    const nodeWithPromptInv: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        inventory: { id: 99, name: 'Prompt Inventory' },
      },
    };

    renderComponent(mockTemplate, nodeWithPromptInv);
    expect(screen.getByText('Prompt Inventory')).toBeInTheDocument();
  });

  it('should render limit from prompt data when available', () => {
    const nodeWithPromptLimit: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        limit: 'prompt-limit-hosts',
      },
    };

    renderComponent(mockTemplate, nodeWithPromptLimit);
    expect(screen.getByText('prompt-limit-hosts')).toBeInTheDocument();
  });

  it('should render scm_branch from prompt data when available', () => {
    const nodeWithPromptBranch: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        scm_branch: 'feature/new-branch',
      },
    };

    renderComponent(mockTemplate, nodeWithPromptBranch);
    expect(screen.getByText('feature/new-branch')).toBeInTheDocument();
  });

  it('should render scm_branch from node when no prompt override', () => {
    const nodeWithBranch: GraphNodeData = {
      ...mockNodeData,
      resource: {
        ...mockNodeData.resource,
        scm_branch: 'develop',
      } as never,
    };

    renderComponent(mockTemplate, nodeWithBranch);
    expect(screen.getByText('develop')).toBeInTheDocument();
  });
});
