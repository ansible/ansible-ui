/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HubMasthead } from './HubMasthead';

vi.mock('../common/useHubActiveUser', () => ({
  useHubActiveUser: () => ({
    activeHubUser: { username: 'hub-user' },
    refreshActiveHubUser: vi.fn(),
  }),
}));

vi.mock('../common/useHubContext', () => ({
  useHubContext: () => ({
    hasPermission: () => false,
  }),
}));

vi.mock('@ansible/common-ui/AboutModal', () => ({
  useAnsibleAboutModal: () => vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: undefined }),
}));

vi.mock('@ansible/ansible-ui-framework/PageMasthead/PageMastheadDropdown', () => ({
  PageMastheadDropdown: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('HubMasthead', () => {
  it('renders masthead with user and help menus', () => {
    render(
      <MemoryRouter>
        <HubMasthead />
      </MemoryRouter>
    );

    expect(screen.getByTestId('masthead-about')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
