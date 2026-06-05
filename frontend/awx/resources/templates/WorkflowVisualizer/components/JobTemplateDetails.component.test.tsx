import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { GraphNodeData } from '../types';
import { JobTemplateDetails } from './JobTemplateDetails';

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
  useGetItem: vi.fn(() => ({ data: undefined })),
}));

import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';

const mockTemplate: JobTemplate = {
  id: 1,
  name: 'Test Job Template',
  type: 'job_template',
  url: '/api/v2/job_templates/1/',
  playbook: 'playbook.yml',
  job_type: 'run',
  verbosity: 0,
  forks: 2,
  limit: 'localhost',
  scm_branch: 'main',
  job_tags: 'tag1,tag2',
  skip_tags: 'skip1',
  diff_mode: false,
  timeout: 60,
  job_slice_count: 1,
  extra_vars: 'my_var: value',
  ask_credential_on_launch: false,
  ask_variables_on_launch: false,
  ask_tags_on_launch: false,
  ask_skip_tags_on_launch: false,
  ask_instance_groups_on_launch: false,
  ask_labels_on_launch: false,
  ask_inventory_on_launch: false,
  ask_job_type_on_launch: false,
  ask_limit_on_launch: false,
  ask_scm_branch_on_launch: false,
  ask_diff_mode_on_launch: false,
  ask_forks_on_launch: false,
  ask_job_slice_count_on_launch: false,
  ask_timeout_on_launch: false,
  ask_verbosity_on_launch: false,
  ask_execution_environment_on_launch: false,
  allow_simultaneous: false,
  webhook_service: 'github',
  opa_query_path: '',
  survey_enabled: false,
  related: {
    webhook_key: '/api/v2/job_templates/1/webhook_key/',
    instance_groups: '/api/v2/job_templates/1/instance_groups/',
    credentials: '/api/v2/job_templates/1/credentials/',
    labels: '/api/v2/job_templates/1/labels/',
    webhook_receiver: '/api/v2/job_templates/1/github/',
  } as never,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    project: { id: 1, name: 'My Project' },
    inventory: { id: 1, name: 'My Inventory' },
    labels: {
      results: [{ id: 1, name: 'production' }],
      count: 1,
    },
    execution_environment: { id: 1, name: 'Default EE' },
  } as never,
} as unknown as JobTemplate;

const mockNodeData: GraphNodeData = {
  resource: {
    id: 1,
    identifier: 'node-1',
    diff_mode: false,
    forks: 2,
    job_type: 'run',
    limit: 'localhost',
    scm_branch: 'main',
    job_tags: 'tag1,tag2',
    skip_tags: 'skip1',
    timeout: 60,
    verbosity: 0,
    job_slice_count: 1,
    extra_data: {},
    all_parents_must_converge: false,
    always_nodes: [],
    failure_nodes: [],
    success_nodes: [],
    related: {
      credentials: '/api/v2/workflow_job_template_nodes/1/credentials/',
      instance_groups: '/api/v2/workflow_job_template_nodes/1/instance_groups/',
      labels: '/api/v2/workflow_job_template_nodes/1/labels/',
    } as never,
    summary_fields: {
      unified_job_template: {
        id: 1,
        name: 'Test Job Template',
        unified_job_type: 'job',
      },
      inventory: { id: 1, name: 'My Inventory' },
      execution_environment: { id: 1, name: 'Default EE' },
    } as never,
  } as never,
  launch_data: undefined as never,
  survey_data: undefined as never,
};

function renderComponent(nodeData = mockNodeData) {
  return render(
    <MemoryRouter>
      <JobTemplateDetails template={mockTemplate} node={nodeData} />
    </MemoryRouter>
  );
}

describe('JobTemplateDetails', () => {
  beforeEach(() => {
    vi.mocked(useGet).mockReturnValue({ data: undefined } as never);
    vi.mocked(useGetItem).mockReturnValue({ data: undefined } as never);
  });

  it('should render the playbook field from template', () => {
    renderComponent();
    expect(screen.getByText('playbook.yml')).toBeInTheDocument();
  });

  it('should render the job type field', () => {
    renderComponent();
    expect(screen.getAllByText('run').length).toBeGreaterThan(0);
  });

  it('should render the organization from template summary fields', () => {
    renderComponent();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should render the project from template summary fields', () => {
    renderComponent();
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('should render job tags from node values when no prompt override', () => {
    renderComponent();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should render skip tags from node values', () => {
    renderComponent();
    expect(screen.getByText('skip1')).toBeInTheDocument();
  });

  it('should render labels from template summary fields', () => {
    renderComponent();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('should render webhook service section when webhook_service is set', () => {
    renderComponent();
    expect(screen.getByText(/github/i)).toBeInTheDocument();
  });

  it('should render variables section', () => {
    renderComponent();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should render credentials when useGet returns credential data', () => {
    vi.mocked(useGet).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('credentials')) {
        return {
          data: {
            results: [{ id: 10, name: 'My SSH Key', credential_type: 1, passwords_needed: [] }],
            count: 1,
          },
        } as never;
      }
      return { data: undefined } as never;
    });

    renderComponent();
    expect(screen.getByText('Credentials')).toBeInTheDocument();
  });

  it('should render instance groups when useGet returns instance group data', () => {
    vi.mocked(useGet).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('instance_groups')) {
        return {
          data: {
            results: [{ id: 5, name: 'My Instance Group' }],
            count: 1,
          },
        } as never;
      }
      return { data: undefined } as never;
    });

    renderComponent();
    expect(screen.getByText('Instance groups')).toBeInTheDocument();
  });

  it('should render execution environment from fetched item when prompt has EE', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: { id: 5, name: 'Custom EE' },
    } as never);

    const nodeWithEE: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        execution_environment: { id: 5 } as never,
      },
    };

    renderComponent(nodeWithEE);
    const eeElements = screen.getAllByText('Custom EE');
    expect(eeElements.length).toBeGreaterThan(0);
  });

  it('should render template EE when template is changed and no prompt EE', () => {
    const nodeWithTemplateChange: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        original: {
          isTemplateChange: true,
          launch_config: {} as never,
        } as never,
      },
    };

    renderComponent(nodeWithTemplateChange);
    expect(screen.getAllByText('Default EE').length).toBeGreaterThan(0);
  });

  it('should render node EE when no prompt override and no template change', () => {
    renderComponent();
    expect(screen.getAllByText('Default EE').length).toBeGreaterThan(0);
  });

  it('should render enabled options when allow_simultaneous is true', () => {
    const templateWithOptions = {
      ...mockTemplate,
      allow_simultaneous: true,
    } as JobTemplate;

    render(
      <MemoryRouter>
        <JobTemplateDetails template={templateWithOptions} node={mockNodeData} />
      </MemoryRouter>
    );
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
  });

  it('should render with survey data merged into variables display', () => {
    const nodeWithSurvey: GraphNodeData = {
      ...mockNodeData,
      survey_data: { survey_key: 'survey_value' },
    };
    renderComponent(nodeWithSurvey);
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should render prompt-overridden inventory name when useGetItem provides it', () => {
    vi.mocked(useGetItem).mockImplementation((api, id) => {
      if (id && String(id) === '2') {
        return { data: { id: 2, name: 'Override Inventory' } } as never;
      }
      return { data: undefined } as never;
    });

    const nodeWithPrompt: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        inventory: { id: 2, name: 'Override Inventory' } as never,
        original: {
          isTemplateChange: false,
          launch_config: {
            ask_inventory_on_launch: true,
          } as never,
        } as never,
      },
    };

    renderComponent(nodeWithPrompt);
    expect(screen.getAllByText('Override Inventory').length).toBeGreaterThan(0);
  });

  it('should not render credentials section when credentials is empty', () => {
    renderComponent();
    expect(screen.queryByText('Credentials')).not.toBeInTheDocument();
  });

  it('should render PromptDetail as empty for empty credential list', () => {
    const nodeWithEmptyPromptCredentials: GraphNodeData = {
      ...mockNodeData,
      launch_data: {
        credentials: [],
        original: {
          launch_config: { ask_credential_on_launch: true } as never,
        } as never,
      },
    };
    renderComponent(nodeWithEmptyPromptCredentials);
    expect(screen.queryByText('Credentials')).not.toBeInTheDocument();
  });
});
