import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { HubContext } from '../../common/useHubContext';
import { CreateRemote } from './RemoteForm';

describe('CreateRemote', () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  beforeEach(() => {
    vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
      const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
        <textarea
          id={props.id as string}
          name={props.id as string}
          value={props.value as string}
          onChange={props.onChange as () => void}
          className={props.className as string}
          onFocus={props.onFocus as () => void}
          onBlur={props.onBlur as () => void}
        />
      ));
      return { DataEditor: FakeDataEditor };
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  function renderCreateRemote(options?: { collectionSigning?: boolean }) {
    return render(
      <HubContext.Provider
        value={{
          featureFlags: { collection_signing: options?.collectionSigning ?? false },
          settings: {},
          hasPermission: () => true,
        }}
      >
        <MemoryRouter initialEntries={['/remotes/create']}>
          <Routes>
            <Route path="/remotes/create" element={<CreateRemote />} />
          </Routes>
        </MemoryRouter>
      </HubContext.Provider>
    );
  }

  test('should display external sync warning alert - Options section', async () => {
    const { container } = renderCreateRemote();

    await waitFor(() => {
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    const warningAlert = container.querySelector('[data-cy="external-sync-warning"]');
    expect(warningAlert).toBeInTheDocument();
    expect(
      screen.getByText(
        /Syncing dependencies outside of repository may cause an issue in repository sync/i
      )
    ).toBeInTheDocument();
  });

  test('should show signed-only warning for community URL', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderCreateRemote({ collectionSigning: true });

    await waitFor(() => {
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    const urlInput = screen.getByRole('textbox', { name: /Server URL/i });
    await user.clear(urlInput);
    await user.paste('https://galaxy.ansible.com/api/');
    await user.click(screen.getByRole('checkbox', { name: /Signed collections only/i }));

    await waitFor(() => {
      const warning = container.querySelector('[data-testid="signed-only-warning"]');
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveTextContent(
        'Community content will never be synced if this setting is enabled'
      );
    });
  });

  test('should hide signed-only warning for non-community URL', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderCreateRemote({ collectionSigning: true });

    await waitFor(() => {
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    const urlInput = screen.getByRole('textbox', { name: /Server URL/i });
    await user.clear(urlInput);
    await user.paste('https://console.redhat.com/api/automation-hub/');
    await user.click(screen.getByRole('checkbox', { name: /Signed collections only/i }));

    await waitFor(() => {
      const warning = container.querySelector('[data-testid="signed-only-warning"]');
      expect(warning).not.toBeInTheDocument();
    });
  });
});
