import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EditCredential } from './EditCredential';

const openTestModal = vi.hoisted(() => vi.fn());
const inputApi = vi.hoisted(() => ({
  current: undefined as
    | {
        setIsTestButtonEnabled: (enabled: boolean) => void;
        setIsTestButtonEnabledSubForm: (enabled: boolean) => void;
        setWatchedSubFormFields: (fields: unknown[]) => void;
        setCredentialPluginValues: (values: unknown[]) => void;
        removeCredentialPluginValue: (fieldName: string) => void;
      }
    | undefined,
}));

vi.mock('./hooks/useCredentialsTestModal', () => ({
  useCredentialsTestModal: () => openTestModal,
}));

vi.mock('./CredentialInputs', () => ({
  CredentialInputs: (props: NonNullable<(typeof inputApi)['current']>) => {
    inputApi.current = props;
    return <div data-testid="credential-inputs" />;
  },
}));

const credential = {
  id: 7,
  name: 'External Credential',
  description: '',
  inputs: {},
  managed: false,
  credential_type: { id: 2, name: 'CyberArk', namespace: 'cyberark', kind: 'external' },
  organization: { id: 1, name: 'Default' },
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
};

const server = setupServer(
  http.get(edaAPI`/eda-credentials/7/`, () => HttpResponse.json(credential)),
  http.options(edaAPI`/eda-credentials/7/`, () =>
    HttpResponse.json({ actions: { PATCH: { name: { type: 'string' } } } })
  ),
  http.get(edaAPI`/credential-types/*`, () =>
    HttpResponse.json({
      count: 1,
      results: [
        {
          id: 2,
          name: 'CyberArk',
          namespace: 'cyberark',
          kind: 'external',
          inputs: { fields: [] },
        },
      ],
    })
  ),
  http.get(edaAPI`/credential-input-sources/*`, () =>
    HttpResponse.json({
      results: [
        {
          id: 5,
          input_field_name: 'password',
          source_credential: 3,
          metadata: { key: 'secret' },
        },
      ],
    })
  ),
  http.delete(edaAPI`/credential-input-sources/5/`, () => new HttpResponse(null, { status: 204 })),
  http.patch(edaAPI`/eda-credentials/7/`, () => HttpResponse.json(credential)),
  http.post(edaAPI`/credential-input-sources/`, () => HttpResponse.json({ id: 9 }, { status: 201 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  openTestModal.mockClear();
});
afterAll(() => server.close());

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/start', '/credentials/edit/7']} initialIndex={1}>
      <Routes>
        <Route path="/start" element={<div>start page</div>} />
        <Route path="/credentials/edit/:id" element={<EditCredential />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditCredential plugins', () => {
  it('enables the external test action from credential input state', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled());

    act(() => {
      inputApi.current?.setIsTestButtonEnabled(true);
      inputApi.current?.setIsTestButtonEnabledSubForm(true);
      inputApi.current?.setWatchedSubFormFields([{ name: 'host' }]);
    });

    const testButton = screen.getByRole('button', { name: 'Test' });
    expect(testButton).toBeEnabled();
    await user.click(testButton);

    expect(openTestModal).toHaveBeenCalled();
    const modalArgs = openTestModal.mock.calls[0]?.[0] as {
      credential: { id: number };
      credentialType: { id: number; kind: string };
      watchedSubFormFields: { name: string }[];
    };
    expect(modalArgs.credential.id).toBe(7);
    expect(modalArgs.credentialType).toMatchObject({ id: 2, kind: 'external' });
    expect(modalArgs.watchedSubFormFields).toEqual([{ name: 'host' }]);
  });

  it('merges plugin values, removes one, and posts the remaining input source', async () => {
    const user = userEvent.setup();
    const posted: { input_field_name?: string }[] = [];
    server.use(
      http.post(edaAPI`/credential-input-sources/`, async ({ request }) => {
        posted.push((await request.json()) as { input_field_name?: string });
        return HttpResponse.json({ id: 9 }, { status: 201 });
      })
    );

    renderEdit();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Save credential/i })).toBeEnabled()
    );

    act(() => {
      inputApi.current?.setCredentialPluginValues([
        {
          input_field_name: 'token',
          source_credential: 8,
          metadata: {},
        },
      ]);
    });
    act(() => {
      inputApi.current?.removeCredentialPluginValue('password');
    });

    await user.click(screen.getByRole('button', { name: /Save credential/i }));

    await waitFor(() => expect(posted.map((item) => item.input_field_name)).toContain('token'));
    expect(posted.map((item) => item.input_field_name)).not.toContain('password');
  });
});
