import {
  PageDialogProvider,
  PageSettingsContext,
  usePageDialog,
  type IPageSettings,
} from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PlatformAbout } from './PlatformAbout';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  const PfAboutModal = actual.AboutModal;
  return {
    ...actual,
    AboutModal: (props: ComponentProps<typeof PfAboutModal>) => (
      <PfAboutModal {...props} disableFocusTrap />
    ),
  };
});

function OpenPlatformAboutDialog() {
  const [, setDialog] = usePageDialog();
  useEffect(() => {
    setDialog(<PlatformAbout platformVersion="2.5" />);
  }, [setDialog]);
  return null;
}

function mountAbout(settings: IPageSettings) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <PageSettingsContext.Provider value={[settings, vi.fn()]}>
        <PageDialogProvider>
          <OpenPlatformAboutDialog />
        </PageDialogProvider>
      </PageSettingsContext.Provider>
    </SWRConfig>
  );
}

describe('PlatformAbout', () => {
  const server = setupServer(
    http.get(awxAPI`/ping/`, () => HttpResponse.json({ version: '4.5.0' })),
    http.get(hubAPI`/`, () => HttpResponse.json({ galaxy_ng_version: '4.9.0' })),
    http.get(edaAPI`/config/`, () => HttpResponse.json({ version: '1.2.0' }))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display brand logo with alt text and default logo src', async () => {
    mountAbout({ activeTheme: 'light' });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Brand Logo' })).toHaveAttribute(
      'src',
      '/assets/platform-logo.svg'
    );
  });

  it('should use white logo when active theme is dark', async () => {
    mountAbout({ activeTheme: 'dark' });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Brand Logo' })).toHaveAttribute(
      'src',
      '/assets/platform-logo-white.svg'
    );
  });

  it('should use standard logo when active theme is light', async () => {
    mountAbout({ activeTheme: 'light' });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Brand Logo' })).toHaveAttribute(
      'src',
      '/assets/platform-logo.svg'
    );
  });

  it('should close when the close button is activated', async () => {
    const user = userEvent.setup();
    mountAbout({ activeTheme: 'light' });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should close when Escape is pressed', async () => {
    const user = userEvent.setup();
    mountAbout({ activeTheme: 'light' });

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    dialog.focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
