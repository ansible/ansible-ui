import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetItem, useGet } from '@ansible/common-ui/crud/useGet';
import { TemplateDetails } from './TemplateDetails';
import { testJobTemplateFixture } from './templateDetails.fixture';

const mockTemplate = { ...testJobTemplateFixture };
const mockWebhookKey = { webhook_key: 'test-webhook-key-value' };

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('webhook_key')) {
      return { data: mockWebhookKey };
    }
    return { data: null };
  }),
  useGetItem: vi.fn(() => ({
    data: mockTemplate,
    error: null,
    refresh: vi.fn(),
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => vi.fn(),
  };
});

describe('TemplateDetails Component', () => {
  beforeEach(() => {
    vi.mocked(useGetItem).mockReturnValue({
      data: mockTemplate,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('webhook_key')) {
        return { data: mockWebhookKey } as ReturnType<typeof useGet>;
      }
      return { data: null } as ReturnType<typeof useGet>;
    });
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );
  });

  it('renders basic detail fields', () => {
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders webhook fields', () => {
    expect(screen.getByText('Webhook service')).toBeInTheDocument();
    expect(screen.getByText('Webhook URL')).toBeInTheDocument();
    expect(screen.getByText('Webhook key')).toBeInTheDocument();
  });

  it('renders job type', () => {
    expect(screen.getByText('run')).toBeInTheDocument();
  });

  it('renders playbook', () => {
    expect(screen.getByText('test-playbook.yml')).toBeInTheDocument();
  });

  it('renders source control branch', () => {
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('renders credentials', () => {
    expect(screen.getByText('Test Credential')).toBeInTheDocument();
  });

  it('renders labels', () => {
    expect(screen.getByText('test-label')).toBeInTheDocument();
  });

  it('renders job tags', () => {
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('renders skip tags', () => {
    expect(screen.getByText('skip1')).toBeInTheDocument();
    expect(screen.getByText('skip2')).toBeInTheDocument();
  });

  it('renders show changes as Off when diff_mode is false', () => {
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('renders limit', () => {
    expect(screen.getByText('test-limit')).toBeInTheDocument();
  });

  it('renders webhook credential', () => {
    expect(screen.getByText('GitHub Webhook')).toBeInTheDocument();
  });

  it('renders Webhooks in enabled options', () => {
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });
});

describe('TemplateDetails - conditional rendering', () => {
  it('should render all enabled options when flags are set', () => {
    const templateAllOptions = {
      ...testJobTemplateFixture,
      become_enabled: true,
      host_config_key: 'test-key',
      allow_simultaneous: true,
      use_fact_cache: true,
      prevent_instance_group_fallback: true,
    };
    vi.mocked(useGetItem).mockReturnValue({
      data: templateAllOptions,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('Privilege Escalation')).toBeInTheDocument();
    expect(screen.getByText('Provisioning Callbacks')).toBeInTheDocument();
    expect(screen.getByText('Concurrent jobs')).toBeInTheDocument();
    expect(screen.getByText('Fact storage')).toBeInTheDocument();
    expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
  });

  it('should render show changes as On when diff_mode is true', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: { ...testJobTemplateFixture, diff_mode: true },
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('should render name as link when templateId is provided', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: testJobTemplateFixture,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails templateId="1" />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Job Template')).toBeInTheDocument();
  });

  it('should render Deleted when organization is missing', () => {
    const noOrgTemplate = {
      ...testJobTemplateFixture,
      summary_fields: {
        ...testJobTemplateFixture.summary_fields,
        organization: undefined,
      },
    };
    vi.mocked(useGetItem).mockReturnValue({
      data: noOrgTemplate,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Deleted').length).toBeGreaterThanOrEqual(1);
  });

  it('should render Deleted when inventory is missing', () => {
    const noInvTemplate = {
      ...testJobTemplateFixture,
      ask_inventory_on_launch: false,
      summary_fields: {
        ...testJobTemplateFixture.summary_fields,
        inventory: undefined,
      },
    };
    vi.mocked(useGetItem).mockReturnValue({
      data: noInvTemplate,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Deleted').length).toBeGreaterThanOrEqual(1);
  });

  it('should render Deleted when project is missing', () => {
    const noProjTemplate = {
      ...testJobTemplateFixture,
      summary_fields: {
        ...testJobTemplateFixture.summary_fields,
        project: undefined,
      },
    };
    vi.mocked(useGetItem).mockReturnValue({
      data: noProjTemplate,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Deleted').length).toBeGreaterThanOrEqual(1);
  });

  it('should render provisioning callback URL when host_config_key is set', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: { ...testJobTemplateFixture, host_config_key: 'abc123' },
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('should render policy enforcement when opa_query_path is set', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: { ...testJobTemplateFixture, opa_query_path: 'policy/check' },
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('policy/check')).toBeInTheDocument();
  });

  it('should not render enabled options when none are set', () => {
    const noOptsTemplate = {
      ...testJobTemplateFixture,
      become_enabled: false,
      host_config_key: '',
      allow_simultaneous: false,
      use_fact_cache: false,
      webhook_service: '',
      prevent_instance_group_fallback: false,
    };
    vi.mocked(useGetItem).mockReturnValue({
      data: noOptsTemplate,
      error: null,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useGetItem>);
    vi.mocked(useGet).mockReturnValue({ data: null } as ReturnType<typeof useGet>);
    render(
      <MemoryRouter>
        <TemplateDetails />
      </MemoryRouter>
    );

    expect(screen.queryByText('Privilege Escalation')).not.toBeInTheDocument();
    expect(screen.queryByText('Concurrent jobs')).not.toBeInTheDocument();
  });
});
