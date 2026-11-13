import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { OAuthGatewayApplications } from './OAuthGatewayApplications';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com/applications',
}));

vi.mock('./OAuthApplicationsTable', () => ({
  OAuthApplicationsTable: () => <div data-testid="oauth-apps-table" />,
}));

describe('OAuthGatewayApplications', () => {
  test('renders header with doc link and applications table', () => {
    render(
      <MemoryRouter>
        <OAuthGatewayApplications />
      </MemoryRouter>
    );

    expect(screen.getByText('OAuth Applications')).toBeInTheDocument();
    expect(screen.getByTestId('oauth-apps-table')).toBeInTheDocument();
  });
});
