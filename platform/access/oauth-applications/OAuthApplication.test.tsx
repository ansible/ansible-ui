import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { Application } from '@ansible/awx-ui/interfaces/Application';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockPageNavigate = vi.fn();
const mockGetPageUrl = vi.fn((route: string) => `/p/${route}`);

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('./hooks/useOAuthApplicationActions', () => ({
  useOAuthApplicationActions: () => [
    { type: 'Button', label: 'mock-actions', selection: 'single' },
  ],
}));

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: () => <div data-testid="routed-tabs" />,
}));

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: () => <div data-testid="awx-error" />,
}));

vi.mock('@ansible/ansible-ui-framework/components/LoadingPage', () => ({
  LoadingPage: () => <div data-testid="loading-page" />,
}));

type UseGetItemResult = {
  data: Application | undefined;
  error: Error | undefined;
  refresh: () => void;
};

const mockUseGetItem = vi.fn<() => UseGetItemResult>();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: (): UseGetItemResult => mockUseGetItem(),
}));

import { OAuthApplication } from './OAuthApplication';

function renderRoute(app: Application | undefined, error: Error | undefined) {
  mockUseGetItem.mockReturnValue({ data: app, error, refresh: vi.fn() });
  return render(
    <MemoryRouter initialEntries={['/applications/12']}>
      <Routes>
        <Route path="/applications/:applicationId" element={<OAuthApplication />} />
      </Routes>
    </MemoryRouter>
  );
}

const sampleApp: Application = {
  id: 12,
  name: 'My OAuth',
  url: '',
  client_type: 'confidential',
  organization: 1,
  type: 'o_auth2_application',
  created: '',
  modified: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
    organization: { id: 1, name: 'Org', description: '' },
  },
};

describe('OAuthApplication', () => {
  test('shows loading while application is undefined', () => {
    renderRoute(undefined, undefined);
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  test('shows AwxError when fetch fails', () => {
    renderRoute(undefined, new Error('fail'));
    expect(screen.getByTestId('awx-error')).toBeInTheDocument();
  });

  test('renders title and tabs when application loads', () => {
    renderRoute(sampleApp, undefined);
    expect(screen.getByTestId('page-title')).toHaveTextContent('My OAuth');
    expect(screen.getByTestId('routed-tabs')).toBeInTheDocument();
  });
});
