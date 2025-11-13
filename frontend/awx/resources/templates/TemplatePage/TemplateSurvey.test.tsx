import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import { TemplateSurveyInternal } from './TemplateSurvey';

vi.mock('../hooks/useSurveyView', () => ({
  useSurveyView: () => ({
    unselectItemsAndRefresh: vi.fn(),
    selectItemsAndRefresh: vi.fn(),
    selectedItems: [],
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectItems: vi.fn(),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    isSelected: vi.fn(),
    itemCount: 0,
    pageItems: [],
    refresh: vi.fn(),
    error: undefined,
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'name',
    setSort: vi.fn(),
    sortDirection: 'asc' as const,
    setSortDirection: vi.fn(),
    filterState: {},
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    keyFn: (item: { variable: string }) => item.variable,
    limitFiltersToOneOrOperation: true as const,
    updateItem: vi.fn(),
  }),
}));

describe('TemplateSurveyInternal', () => {
  const mockJobTemplate = {
    id: 1,
    type: 'job_template',
    name: 'Test Job Template',
    description: '',
    job_type: 'run',
    inventory: 1,
    project: 1,
    playbook: 'test.yml',
    summary_fields: {
      user_capabilities: {
        edit: true,
        delete: true,
        start: true,
        schedule: true,
        copy: true,
      },
      inventory: {
        id: 1,
        name: 'Test Inventory',
        description: '',
        has_active_failures: false,
        total_hosts: 0,
        hosts_with_active_failures: 0,
        total_groups: 0,
        has_inventory_sources: false,
        total_inventory_sources: 0,
        inventory_sources_with_failures: 0,
        organization_id: 1,
        kind: '',
      },
      project: { id: 1, name: 'Test Project' },
      organization: { id: 1, name: 'Default', description: '' },
      created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
      modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
      object_roles: {
        admin_role: { id: 1, name: 'Admin', description: '' },
        execute_role: { id: 2, name: 'Execute', description: '' },
        read_role: { id: 3, name: 'Read', description: '' },
      },
      labels: { count: 0, results: [] },
      recent_jobs: [],
      credentials: [],
    },
    survey_enabled: false,
    created: '2025-01-01T00:00:00.000Z',
    modified: '2025-01-01T00:00:00.000Z',
    url: '/api/v2/job_templates/1/',
    related: {
      callback: '',
      named_url: '',
      created_by: '',
      modified_by: '',
      labels: '',
      inventory: '',
      project: '',
      organization: '',
      credentials: '',
      last_job: '',
      jobs: '',
      schedules: '',
      activity_stream: '',
      launch: '',
      webhook_key: '',
      webhook_receiver: '',
      notification_templates_started: '',
      notification_templates_success: '',
      notification_templates_error: '',
      access_list: '',
      survey_spec: '',
      object_roles: '',
      instance_groups: '',
      slice_workflow_jobs: '',
      copy: '',
    },
  } as unknown as JobTemplate;

  const mockOnToggleSurvey = vi.fn();

  test('renders TemplateSurveyInternal component without errors', () => {
    const { container } = render(
      <MemoryRouter>
        <TemplateSurveyInternal template={mockJobTemplate} onToggleSurvey={mockOnToggleSurvey} />
      </MemoryRouter>
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('There are currently no survey questions.')).toBeInTheDocument();
  });

  test('renders create button when user has edit permissions', () => {
    render(
      <MemoryRouter>
        <TemplateSurveyInternal template={mockJobTemplate} onToggleSurvey={mockOnToggleSurvey} />
      </MemoryRouter>
    );

    expect(screen.getByText('There are currently no survey questions.')).toBeInTheDocument();
    expect(
      screen.getByText('Create a survey question by clicking the button below.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create survey question/i })).toBeInTheDocument();
  });

  test('shows no-permission empty state when user lacks edit capability', () => {
    const templateWithoutPermissions: JobTemplate = {
      ...mockJobTemplate,
      summary_fields: {
        ...mockJobTemplate.summary_fields,
        user_capabilities: {
          edit: false,
          delete: false,
          start: true,
          schedule: true,
          copy: true,
        },
      },
    };

    render(
      <MemoryRouter>
        <TemplateSurveyInternal
          template={templateWithoutPermissions}
          onToggleSurvey={mockOnToggleSurvey}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No survey questions found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please contact your organization administrator if there is an issue with your access.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Create survey question/i })).not.toBeInTheDocument();
  });

  test('accepts onToggleSurvey callback prop', () => {
    const customToggle = vi.fn();

    render(
      <MemoryRouter>
        <TemplateSurveyInternal template={mockJobTemplate} onToggleSurvey={customToggle} />
      </MemoryRouter>
    );

    expect(screen.getByText('There are currently no survey questions.')).toBeInTheDocument();
  });
});
