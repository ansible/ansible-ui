import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DeprecationDetails } from './DeprecationDetails';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageDetail: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div data-testid={`detail-${label}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  ),
  PageDetails: ({ children }: { children: React.ReactNode }) => (
    <dl data-testid="page-details">{children}</dl>
  ),
}));

function renderWithRoute(deprecationType: string) {
  const encoded = encodeURIComponent(deprecationType);
  return render(
    <MemoryRouter initialEntries={[`/deprecations/${encoded}/details`]}>
      <Routes>
        <Route path="/deprecations/:deprecationType/details" element={<DeprecationDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeprecationDetails', () => {
  it('should render pattern and description for a known deprecation type', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByText('with_items on module')).toBeInTheDocument();
    expect(
      screen.getByText('Using with_items on package modules (yum, dnf, apt)')
    ).toBeInTheDocument();
  });

  it('should render impact information for with_items on module', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByText('Removed in Ansible Core 2.17')).toBeInTheDocument();
  });

  it('should render remediation details for with_items on module', () => {
    renderWithRoute('with_items on module');

    expect(
      screen.getByText(/Replace with_items with a list passed directly to the module parameter/)
    ).toBeInTheDocument();
  });

  it('should render before and after code examples for with_items on module', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByText('Before (deprecated)')).toBeInTheDocument();
    expect(screen.getByText('After (recommended)')).toBeInTheDocument();
    expect(screen.getByText(/with_items:/)).toBeInTheDocument();
  });

  it('should render details for Bare variables in conditionals', () => {
    renderWithRoute('Bare variables in conditionals');

    expect(screen.getByText('Bare variables in conditionals')).toBeInTheDocument();
    expect(
      screen.getByText('Variables in when statements should use {{ }} syntax')
    ).toBeInTheDocument();
    expect(screen.getByText('Removed in Ansible Core 2.16')).toBeInTheDocument();
  });

  it('should render details for include directive', () => {
    renderWithRoute('include directive');

    expect(screen.getByText('include directive')).toBeInTheDocument();
    expect(screen.getByText('Use import_tasks or include_tasks instead')).toBeInTheDocument();
    expect(screen.getByText('Removed in Ansible Core 2.16')).toBeInTheDocument();
  });

  it('should render details for with_dict loop', () => {
    renderWithRoute('with_dict loop');

    expect(screen.getByText('with_dict loop')).toBeInTheDocument();
    expect(
      screen.getByText('Deprecated in favor of loop with dict2items filter')
    ).toBeInTheDocument();
  });

  it('should render details for squash_actions', () => {
    renderWithRoute('squash_actions');

    expect(screen.getByText('squash_actions')).toBeInTheDocument();
    expect(screen.getByText('Invoking modules only once while using loop')).toBeInTheDocument();
  });

  it('should render details for hash_behaviour', () => {
    renderWithRoute('hash_behaviour');

    expect(screen.getByText('hash_behaviour')).toBeInTheDocument();
    expect(screen.getByText('Deprecated ansible.cfg setting for hash merging')).toBeInTheDocument();
  });

  it('should handle unknown deprecation type gracefully', () => {
    renderWithRoute('unknown_deprecation');

    expect(screen.getByText('unknown_deprecation')).toBeInTheDocument();
    expect(screen.getByText('Deprecated Ansible pattern')).toBeInTheDocument();
    expect(screen.queryByText('Resolution')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
  });

  it('should handle URL-encoded deprecation type', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByText('Pattern')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
