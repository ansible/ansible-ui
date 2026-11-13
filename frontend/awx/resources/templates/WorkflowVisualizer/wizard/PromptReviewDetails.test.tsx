import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PromptReviewDetails } from './PromptReviewDetails';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: {
      prompt: {
        job_type: 'run',
        inventory: { id: 1, name: 'Demo inventory' },
        credentials: [],
        extra_vars: '{}',
      },
      resource: {
        id: 1,
        type: 'job_template',
        name: 'Demo template',
        summary_fields: { organization: { id: 1, name: 'Default' } },
      },
      survey: {},
    },
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl: () => () => '/',
  };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: null }),
  useGetItem: () => ({ data: { id: 1, name: 'Demo inventory', type: 'inventory' } }),
}));

vi.mock('../../../../common/useVerbosityString', () => ({
  useVerbosityString: () => '0',
}));

describe('PromptReviewDetails', () => {
  it('renders prompt review fields from wizard data', () => {
    render(
      <MemoryRouter>
        <PromptReviewDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('Job type')).toBeInTheDocument();
    expect(screen.getByText('run')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
