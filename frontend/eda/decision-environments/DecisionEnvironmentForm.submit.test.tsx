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
            name: 'Created DE',
            image_url: 'quay.io/ansible/ansible-rulebook:main',
            organization_id: 1,
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

import { CreateDecisionEnvironment, EditDecisionEnvironment } from './DecisionEnvironmentForm';

const server = setupServer();

describe('DecisionEnvironmentForm submit', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  beforeEach(() => {
    pageNavigate.mockClear();
    server.use(
      http.get(/organizations/, () => HttpResponse.json({ results: [{ id: 1, name: 'Default' }] })),
      http.options(edaAPI`/decision-environments/`, () =>
        HttpResponse.json({ actions: { POST: { name: {}, pull_policy: { choices: [] } } } })
      ),
      http.post(edaAPI`/decision-environments/`, async ({ request }) => {
        const body = (await request.json()) as object;
        return HttpResponse.json({ id: 42, ...body });
      }),
      http.patch(edaAPI`/decision-environments/5/`, async ({ request }) => {
        const body = (await request.json()) as object;
        return HttpResponse.json({ id: 5, ...body });
      })
    );
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should create a decision environment and navigate to its page', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateDecisionEnvironment />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: /Create decision environment/i }));
    await waitFor(() => {
      expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.DecisionEnvironmentPage, {
        params: { id: 42 },
      });
    });
  });

  it('should save an existing decision environment', async () => {
    const user = userEvent.setup();
    let patched: unknown;
    server.use(
      http.get(edaAPI`/decision-environments/5/`, () =>
        HttpResponse.json({
          id: 5,
          name: 'Existing DE',
          image_url: 'quay.io/ansible/ansible-rulebook:main',
          organization: { id: 1, name: 'Default' },
        })
      ),
      http.options(edaAPI`/decision-environments/5/`, () =>
        HttpResponse.json({ actions: { PATCH: { name: {} } } })
      ),
      http.patch(edaAPI`/decision-environments/5/`, async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json({ id: 5 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/decision-environments/edit/5']}>
        <Routes>
          <Route path="/decision-environments/edit/:id" element={<EditDecisionEnvironment />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: /Save decision environment/i }));
    await waitFor(() => {
      expect(patched).toMatchObject({ name: 'Created DE' });
    });
  });
});
