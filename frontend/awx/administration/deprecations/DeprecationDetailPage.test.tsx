import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DeprecationDetailPage } from './DeprecationDetailPage';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageHeader: ({
    title,
    breadcrumbs,
    headerActions,
  }: {
    title: string;
    breadcrumbs: Array<{ label: string; to?: string }>;
    headerActions?: React.ReactNode;
  }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <nav data-testid="breadcrumbs">
        {breadcrumbs.map((b) => (
          <span key={b.label}>{b.label}</span>
        ))}
      </nav>
      {headerActions && <div data-testid="header-actions">{headerActions}</div>}
    </div>
  ),
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  useGetPageUrl: () => (route: string) => `/awx/${route}`,
}));

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: ({
    tabs,
    backTab,
  }: {
    tabs: Array<{ label: string; page: string }>;
    backTab?: { label: string };
  }) => (
    <div data-testid="page-tabs">
      {backTab && <div data-testid="back-tab">{backTab.label}</div>}
      {tabs.map((tab) => (
        <div key={tab.label} data-testid={`tab-${tab.label.toLowerCase().replaceAll(/\s+/g, '-')}`}>
          {tab.label}
        </div>
      ))}
    </div>
  ),
}));

function renderWithRoute(deprecationType: string) {
  const encoded = encodeURIComponent(deprecationType);
  return render(
    <MemoryRouter initialEntries={[`/deprecations/${encoded}`]}>
      <Routes>
        <Route path="/deprecations/:deprecationType" element={<DeprecationDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeprecationDetailPage', () => {
  it('should render page layout with title and breadcrumbs', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'with_items on module' })).toBeInTheDocument();
    expect(screen.getByText('Deprecations')).toBeInTheDocument();
  });

  it('should render documentation link for known deprecation type', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    const docLink = screen.getByRole('link', { name: /Documentation/ });
    expect(docLink).toBeInTheDocument();
    expect(docLink).toHaveAttribute(
      'href',
      'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html'
    );
    expect(docLink).toHaveAttribute('target', '_blank');
  });

  it('should render documentation link for Bare variables in conditionals', () => {
    renderWithRoute('Bare variables in conditionals');

    const docLink = screen.getByRole('link', { name: /Documentation/ });
    expect(docLink).toHaveAttribute(
      'href',
      'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html'
    );
  });

  it('should render documentation link for include directive', () => {
    renderWithRoute('include directive');

    const docLink = screen.getByRole('link', { name: /Documentation/ });
    expect(docLink).toHaveAttribute(
      'href',
      'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html'
    );
  });

  it('should not render documentation link for unknown deprecation type', () => {
    renderWithRoute('unknown_pattern');

    expect(screen.queryByTestId('header-actions')).not.toBeInTheDocument();
  });

  it('should render tabs for Details and Affected Jobs', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByTestId('tab-details')).toBeInTheDocument();
    expect(screen.getByTestId('tab-affected-jobs')).toBeInTheDocument();
  });

  it('should render back tab to Deprecations', () => {
    renderWithRoute('with_items on module');

    expect(screen.getByTestId('back-tab')).toBeInTheDocument();
    expect(screen.getByText('Back to Deprecations')).toBeInTheDocument();
  });

  it('should render documentation links for all known deprecation types', () => {
    const knownTypes = [
      'with_items on module',
      'Bare variables in conditionals',
      'include directive',
      'with_dict loop',
      'squash_actions',
      'hash_behaviour',
    ];

    for (const type of knownTypes) {
      const { unmount } = renderWithRoute(type);
      expect(screen.getByRole('link', { name: /Documentation/ })).toBeInTheDocument();
      unmount();
    }
  });
});
