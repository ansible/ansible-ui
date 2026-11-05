import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdaUser } from '../interfaces/EdaUser';

const activeUserState: {
  activeEdaUser: EdaUser | null | undefined;
  refreshActiveEdaUser: ReturnType<typeof vi.fn>;
} = {
  activeEdaUser: undefined,
  refreshActiveEdaUser: vi.fn(),
};

vi.mock('../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => activeUserState,
}));

vi.mock('@ansible/common-ui/AnsibleLogin/AnsibleLogin', () => ({
  AnsibleLogin: ({ loginApiUrl, onSuccess }: { loginApiUrl: string; onSuccess: () => void }) => (
    <div>
      <span>login-form</span>
      <span>{loginApiUrl}</span>
      <button onClick={onSuccess}>complete-login</button>
    </div>
  ),
}));

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    mutate: vi.fn(),
  };
});

import { EdaLogin } from './EdaLogin';

describe('EdaLogin', () => {
  it('should render a loading state while the active user is unknown', () => {
    activeUserState.activeEdaUser = undefined;

    render(
      <EdaLogin>
        <div>protected</div>
      </EdaLogin>
    );

    expect(screen.queryByText('protected')).not.toBeInTheDocument();
    expect(screen.queryByText('login-form')).not.toBeInTheDocument();
  });

  it('should render the login form when there is no active user', async () => {
    activeUserState.activeEdaUser = null;
    const { mutate } = await import('swr');

    render(
      <EdaLogin>
        <div>protected</div>
      </EdaLogin>
    );

    expect(screen.getByText('login-form')).toBeInTheDocument();
    expect(screen.queryByText('protected')).not.toBeInTheDocument();

    screen.getByRole('button', { name: 'complete-login' }).click();
    expect(activeUserState.refreshActiveEdaUser).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalled();
  });

  it('should render children when an active user is present', () => {
    activeUserState.activeEdaUser = { id: 1, username: 'admin' } as EdaUser;

    render(
      <EdaLogin>
        <div>protected</div>
      </EdaLogin>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
    expect(screen.queryByText('login-form')).not.toBeInTheDocument();
  });
});
