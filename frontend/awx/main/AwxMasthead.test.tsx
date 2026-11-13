import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../common/api/awx-utils';
import { AwxRoute } from './AwxRoutes';

const { refreshActiveAwxUser, pageNavigate } = vi.hoisted(() => ({
  refreshActiveAwxUser: vi.fn(),
  pageNavigate: vi.fn(),
}));

vi.mock('../common/useAwxActiveUser', () => ({
  useAwxActiveUser: () => ({
    activeAwxUser: { id: 7, username: 'awx-admin' },
    refreshActiveAwxUser,
  }),
}));

vi.mock('../common/useAwxConfig', () => ({
  useAwxConfig: () => ({
    docsRoot: 'https://docs.redhat.com',
    version: '2.5',
  }),
}));

vi.mock('../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: vi.fn(),
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

vi.mock('../../assets/awx-logo.svg?react', () => ({
  default: () => <div data-testid="awx-brand" />,
}));

import { AwxMasthead } from './AwxMasthead';

const server = setupServer(
  http.get(awxAPI`/workflow_approvals/`, () =>
    HttpResponse.json({
      count: 0,
      results: [],
    })
  )
);

describe('AwxMasthead', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    refreshActiveAwxUser.mockClear();
    pageNavigate.mockClear();
  });
  afterAll(() => server.close());

  it('should render help and account menus for the active user', async () => {
    const user = userEvent.setup({ delay: null });
    let logoutRequests = 0;
    server.use(
      http.post('/api/logout/', () => {
        logoutRequests += 1;
        return HttpResponse.json({});
      })
    );

    const { container } = render(
      <MemoryRouter>
        <PageDialogProvider>
          <AwxMasthead />
        </PageDialogProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('awx-brand')).toBeInTheDocument();

    const helpMenuToggle = container.querySelector('#help-menu-menu-toggle');
    expect(helpMenuToggle).not.toBeNull();
    await user.click(helpMenuToggle as HTMLButtonElement);
    expect(screen.getByRole('menuitem', { name: 'Documentation' })).toHaveAttribute(
      'href',
      expect.stringContaining('docs')
    );

    await user.click(screen.getByRole('menuitem', { name: 'About' }));
    expect(await screen.findByTestId('about-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'awx-admin' }));
    await user.click(screen.getByRole('menuitem', { name: 'User details' }));
    expect(pageNavigate).toHaveBeenCalledWith(AwxRoute.UserDetails, { params: { id: 7 } });

    await user.click(screen.getByRole('button', { name: 'awx-admin' }));
    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));
    await waitFor(() => {
      expect(logoutRequests).toBe(1);
    });
    expect(refreshActiveAwxUser).toHaveBeenCalled();
    expect(pageNavigate).toHaveBeenCalledWith(AwxRoute.Login);
  }, 15000);
});
