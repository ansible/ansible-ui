import {
  PageDialogProvider,
  PageNavSideBarProvider,
  PageSettingsContext,
  type IPageSettings,
  type WindowSize,
} from '@ansible/ansible-ui-framework';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QuickStart } from '@patternfly/quickstarts';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformMasthead } from './PlatformMasthead';
import { PlatformRoute } from './PlatformRoutes';

const { mockPageNavigate, mockUseBreakpoint } = vi.hoisted(() => ({
  mockPageNavigate: vi.fn(),
  mockUseBreakpoint: vi.fn((_size: WindowSize) => true),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    PageNotificationsIcon: () => <span data-testid="notifications-stub" />,
    useBreakpoint: (size: WindowSize) => mockUseBreakpoint(size),
  };
});

vi.mock('@ansible/awx-ui/main/AwxMasthead', () => ({
  useAwxNotifications: () => undefined,
}));

vi.mock('@ansible/hub-ui/main/HubMasthead', () => ({
  useHubNotifications: () => undefined,
}));

vi.mock('../notifications/useRssNotifications', () => ({
  useRssNotifications: () => undefined,
}));

vi.mock('@ansible/awx-ui/common/useAwxActiveUser', () => ({
  useAwxActiveUser: () => ({ refreshActiveAwxUser: vi.fn() }),
}));

vi.mock('@ansible/eda-ui/common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({ refreshActiveEdaUser: vi.fn() }),
}));

vi.mock('@ansible/hub-ui/common/useHubActiveUser', () => ({
  useHubActiveUser: () => ({ refreshActiveHubUser: vi.fn() }),
}));

vi.mock('@ansible/common-ui/utils/useDocsVersion', () => ({
  useDocsVersion: () => ({ version: '2.5' }),
}));

vi.mock('@ansible/common-ui/PageRefreshIcon', () => ({
  PageRefreshIcon: () => null,
}));

vi.mock('@ansible/chatbot/ChatbotToolbarItem', () => ({
  ChatbotToolbarItem: () => null,
}));

vi.mock('../overview/quickstarts/useQuickStarts', () => ({
  useQuickStarts: vi.fn(() => [{ metadata: { name: 'qs-1' } } as QuickStart]),
}));

vi.mock('./PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({
    activePlatformUser: { id: 1, username: 'admin' },
    refreshActivePlatformUser: vi.fn(),
  }),
}));

vi.mock('./GatewayUIAuth', () => ({
  useIsManagedCloudInstall: () => false,
}));

function mountMasthead(settings?: IPageSettings) {
  const pageSettings: IPageSettings = settings ?? { activeTheme: 'light', theme: 'light' };
  return render(
    <MemoryRouter>
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <PageSettingsContext.Provider value={[pageSettings, vi.fn()]}>
          <PageNavSideBarProvider>
            <PageDialogProvider>
              <PlatformMasthead />
            </PageDialogProvider>
          </PageNavSideBarProvider>
        </PageSettingsContext.Provider>
      </SWRConfig>
    </MemoryRouter>
  );
}

function getHelpMenuToggle(): HTMLElement {
  const el = document.getElementById('help-menu-menu-toggle');
  if (!el) {
    throw new Error('Expected #help-menu-menu-toggle to be in the document');
  }
  return el;
}

describe('PlatformMasthead help menu', () => {
  beforeEach(() => {
    mockPageNavigate.mockClear();
    mockUseBreakpoint.mockImplementation(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display help toggle with correct initial state and toggle open/closed', async () => {
    const user = userEvent.setup();
    mountMasthead();

    const helpToggle = getHelpMenuToggle();
    expect(helpToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(helpToggle);
    expect(helpToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('masthead-documentation')).toBeVisible();
    expect(screen.getByTestId('masthead-about')).toBeVisible();

    await user.click(helpToggle);
    expect(helpToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should display documentation link with correct href', async () => {
    const user = userEvent.setup();
    mountMasthead();

    await user.click(getHelpMenuToggle());
    const docItem = screen.getByTestId('masthead-documentation');
    expect(within(docItem).getByRole('menuitem', { name: 'Documentation' })).toHaveAttribute(
      'href',
      'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform'
    );
  });

  it('should call pageNavigate for Quick starts when the entry is shown', async () => {
    const user = userEvent.setup();
    mountMasthead();

    await user.click(getHelpMenuToggle());
    await user.click(screen.getByRole('menuitem', { name: 'Quick starts' }));
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.QuickStarts);
  });

  it('should be keyboard navigable on the help menu toggle', async () => {
    const user = userEvent.setup();
    mountMasthead();

    const helpToggle = getHelpMenuToggle();
    helpToggle.focus();
    expect(helpToggle).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(helpToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('masthead-documentation')).toBeVisible();

    await user.keyboard('{Escape}');
    expect(helpToggle).toHaveAttribute('aria-expanded', 'false');

    helpToggle.focus();
    await user.keyboard('{Enter}');
    expect(helpToggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(helpToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should keep help menu usable when only small breakpoints resolve', async () => {
    const user = userEvent.setup();
    mockUseBreakpoint.mockImplementation((size: WindowSize) => size === 'sm');
    mountMasthead();

    const helpToggle = getHelpMenuToggle();
    expect(helpToggle).toBeVisible();
    await user.click(helpToggle);
    expect(screen.getByTestId('masthead-documentation')).toBeVisible();
    expect(screen.getByTestId('masthead-about')).toBeVisible();
  });
});
