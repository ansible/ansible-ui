import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Token } from '../../../interfaces/Token';
import { UserTokenSecretsModal } from './UserTokenSecretsModal';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      onClose,
      ...props
    }: {
      children: ReactNode;
      onClose: () => void;
      'aria-label'?: string;
    }) => (
      <dialog aria-label={props['aria-label']} data-testid="modal" open>
        <button type="button" aria-label="Close" onClick={onClose} />
        {children}
      </dialog>
    ),
  };
});

const baseToken: Omit<Token, 'token' | 'refresh_token' | 'application'> = {
  id: 8,
  type: 'o_auth2_access_token',
  url: '/api/v2/tokens/8/',
  summary_fields: {
    user: { id: 3, username: 'dev', first_name: '', last_name: '' },
    application: { id: 0, name: '' },
  },
  created: '2024-04-29T14:37:26.186275Z',
  modified: '2024-04-29T14:37:26.199763Z',
  description: 'test token',
  user: 3,
  expires: '3023-08-31T14:37:26.177400Z',
  last_used: null,
  scope: 'write',
};

const patToken: Token = {
  ...baseToken,
  application: null as unknown as number,
  token: 'xyz-abc-0123456',
  refresh_token: undefined,
};

const appToken: Token = {
  ...baseToken,
  id: 30,
  application: 1,
  token: '1234-abcdef-6789',
  refresh_token: 'abcd-000000-1234',
};

function renderModal(token: Token, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <UserTokenSecretsModal newToken={token} onClose={onClose} />
    </MemoryRouter>
  );
}

describe('UserTokenSecretsModal', () => {
  it('should render modal with token and expires for personal access token', () => {
    renderModal(patToken);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue(patToken.token!)).toBeInTheDocument();
    expect(screen.getByText(/8\/31\/3023/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(appToken.refresh_token!)).not.toBeInTheDocument();
  });

  it('should render modal with token, refresh token and expires for application token', () => {
    renderModal(appToken);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue(appToken.token!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(appToken.refresh_token!)).toBeInTheDocument();
    expect(screen.getByText(/8\/31\/3023/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(appToken, onClose);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledWith(undefined);
  });
});
