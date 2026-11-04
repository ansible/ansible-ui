import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { edaAPI } from '../common/eda-utils';
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

vi.mock('@ansible/common-ui/PageRefreshIcon', () => ({
  PageRefreshIcon: () => null,
}));

vi.mock('../../assets/eda-logo.svg?react', () => ({
  default: () => <div data-testid="eda-brand" />,
}));

import { EdaMasthead } from './EdaMasthead';

const server = setupServer();

describe('EdaMasthead', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    refreshActiveEdaUser.mockClear();
    pageNavigate.mockClear();
  });
  afterAll(() => server.close());

  it('should render help and account menus for the active user', async () => {
    const user = userEvent.setup({ delay: null });
    let logoutRequests = 0;
    server.use(
      http.post(edaAPI`/auth/session/logout/`, () => {
        logoutRequests += 1;
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(
      <MemoryRouter>
        <PageDialogProvider>
          <EdaMasthead />
        </PageDialogProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('eda-brand')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByRole('menuitem', { name: 'Documentation' })).toHaveAttribute(
      'href',
      expect.stringContaining('documentation')
    );

    await user.click(screen.getByRole('menuitem', { name: 'About' }));
    expect(await screen.findByTestId('about-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'eda-admin' }));
    await user.click(screen.getByRole('menuitem', { name: 'User details' }));
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.MyPage);

    await user.click(screen.getByRole('button', { name: 'eda-admin' }));
    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));
    await waitFor(() => {
      expect(logoutRequests).toBe(1);
    });
    expect(refreshActiveEdaUser).toHaveBeenCalled();
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.Overview);
  });
});
