/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { EdaRoute } from './EdaRoutes';

const { refreshActiveEdaUser, pageNavigate } = vi.hoisted(() => ({
  refreshActiveEdaUser: vi.fn(),
  pageNavigate: vi.fn(),
}));

vi.mock('../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({
    activeEdaUser: { username: 'eda-admin' },
    refreshActiveEdaUser,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title?: string }) => (
      <div data-testid="modal">
        {title ? <h1>{title}</h1> : null}
        {children}
      </div>
    ),
    AboutModal: ({
      children,
      productName,
    }: {
      children: React.ReactNode;
      productName?: string;
    }) => (
      <div data-testid="about-modal">
        <span>{productName}</span>
        {children}
      </div>
    ),
  };
});

vi.mock('@ansible/common-ui/crud/Data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/common-ui/crud/Data')>();
  return {
    ...actual,
    postRequest: vi.fn().mockResolvedValue({}),
  };
});

vi.mock('../../assets/eda-logo.svg?react', () => ({
  default: () => <div data-testid="eda-brand" />,
}));

import { postRequest } from '@ansible/common-ui/crud/Data';
import { EdaMasthead } from './EdaMasthead';

describe('EdaMasthead', () => {
  it('should render help and account menus for the active user', async () => {
    const user = userEvent.setup({ delay: null, pointerEventsCheck: 0 });
    render(
      <MemoryRouter>
        <PageDialogProvider>
          <EdaMasthead />
        </PageDialogProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('eda-brand')).toBeInTheDocument();

    await user.click(document.getElementById('help-menu-menu-toggle')!);
    expect(screen.getByTestId('masthead-documentation')).toHaveAttribute(
      'href',
      expect.stringContaining('documentation')
    );

    await user.click(screen.getByRole('menuitem', { name: 'About' }));
    expect(await screen.findByTestId('about-modal')).toBeInTheDocument();

    await user.click(document.getElementById('account-menu-menu-toggle')!);
    await user.click(screen.getByText('User details'));
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.MyPage);

    await user.click(document.getElementById('account-menu-menu-toggle')!);
    await user.click(screen.getByText('Logout'));
    expect(postRequest).toHaveBeenCalled();
    expect(refreshActiveEdaUser).toHaveBeenCalled();
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.Overview);
  });
});
