import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
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

  test('should display external sync warning alert - Options section', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/remotes/create']}>
        <Routes>
          <Route path="/remotes/create" element={<CreateRemote />} />
        </Routes>
      </MemoryRouter>
    );

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
});
