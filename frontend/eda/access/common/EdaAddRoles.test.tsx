/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaAddRoles } from './EdaAddRoles';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: ({ steps }: { steps: { id: string; label: string }[] }) => (
      <div data-testid="page-wizard">
        {steps.map((step) => (
          <div key={step.id}>{step.label}</div>
        ))}
      </div>
    ),
  };
});

describe('EdaAddRoles', () => {
  it('should render the wizard with step labels', async () => {
    render(
      <MemoryRouter>
        <EdaAddRoles id="1" type="user" resourceName="testuser" onClose={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Select a resource type')).toBeInTheDocument();
    });
    expect(screen.getByText('Select resources')).toBeInTheDocument();
    expect(screen.getByText('Select roles to apply')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });
});
