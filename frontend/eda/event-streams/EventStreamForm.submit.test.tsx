/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { EdaRoute } from '../main/EdaRoutes';

const { pageNavigate } = vi.hoisted(() => ({
  pageNavigate: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../common/EdaPageForm', () => ({
  EdaPageForm: ({
    onSubmit,
    onCancel,
    submitText,
  }: {
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
    onCancel: () => void;
    submitText: string;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          void onSubmit({
            name: 'Created stream',
            organization_id: 1,
            enabled: true,
            type_id: 1,
          })
        }
      >
        {submitText}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

import { CreateEventStream, EditEventStream } from './EventStreamForm';

const server = setupServer();

describe('EventStreamForm submit', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  beforeEach(() => {
    pageNavigate.mockClear();
    server.use(
      http.get(/organizations/, () => HttpResponse.json({ results: [{ id: 1, name: 'Default' }] })),
      http.post(edaAPI`/event-streams/`, async ({ request }) => {
        const body = (await request.json()) as object;
        return HttpResponse.json({ id: 77, ...body });
      })
    );
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should create an event stream in test_mode false when enabled', async () => {
    const user = userEvent.setup();
    let created: { test_mode?: boolean } | undefined;
    server.use(
      http.post(edaAPI`/event-streams/`, async ({ request }) => {
        created = (await request.json()) as { test_mode?: boolean };
        return HttpResponse.json({ id: 77, ...created });
      })
    );

    render(
      <MemoryRouter>
        <CreateEventStream />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: /Create event stream/i }));
    await waitFor(() => {
      expect(created?.test_mode).toBe(false);
      expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.EventStreamPage, { params: { id: 77 } });
    });
  });

  it('should save an existing event stream', async () => {
    const user = userEvent.setup();
    let patched: { test_mode?: boolean } | undefined;
    server.use(
      http.get(edaAPI`/event-streams/1/`, () =>
        HttpResponse.json({
          id: 1,
          name: 'Existing stream',
          event_stream_type: 'basic',
          organization: { id: 1, name: 'Default' },
          eda_credential: { id: 4, name: 'Basic cred' },
          test_mode: true,
        })
      ),
      http.options(edaAPI`/event-streams/1/`, () =>
        HttpResponse.json({ actions: { PATCH: { name: {} } } })
      ),
      http.patch(edaAPI`/event-streams/1/`, async ({ request }) => {
        patched = (await request.json()) as { test_mode?: boolean };
        return HttpResponse.json({ id: 1 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/event-streams/edit/1']}>
        <Routes>
          <Route path="/event-streams/edit/:id" element={<EditEventStream />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: /Save event stream/i }));
    await waitFor(() => {
      expect(patched?.test_mode).toBe(false);
    });
  });
});
