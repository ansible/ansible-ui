import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowJobTemplateDetails } from './WorkflowJobTemplateDetails';
import { testWorkflowJobTemplateFixture } from './workflowJobTemplateDetails.fixture';

const mockTemplate = { ...testWorkflowJobTemplateFixture };
const mockWebhookKey = { webhook_key: 'test-webhook-key-value' };

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url && url.includes('webhook_key')) {
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

describe('WorkflowJobTemplateDetails Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <WorkflowJobTemplateDetails />
      </MemoryRouter>
    );
  });

  it('renders basic detail fields', () => {
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders Activity field with Sparkline', () => {
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('renders Source control branch and Limit fields', () => {
    expect(screen.getByText('Source control branch')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
  });

  it('renders webhook fields', () => {
    expect(screen.getByText('Webhook service')).toBeInTheDocument();
    expect(screen.getByText('Webhook URL')).toBeInTheDocument();
    expect(screen.getByText('Webhook key')).toBeInTheDocument();
  });
});
