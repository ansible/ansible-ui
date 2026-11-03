import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { DecisionEnvironmentPage } from './DecisionEnvironmentPage';

const pageNavigate = vi.fn();
const deleteDecisionEnvironment = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../hooks/useDeleteDecisionEnvironments', () => ({
  useDeleteDecisionEnvironment: () => deleteDecisionEnvironment,
}));

const mockDecisionEnvironment = {
  id: 5,
  name: 'Default DE',
  image_url: 'quay.io/ansible/ansible-rulebook:main',
};

const mockOptions = {
  actions: {
    GET: { name: { type: 'string' } },
    PATCH: { name: { type: 'string' } },
  },
};

const server = setupServer();

function renderPage() {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}
    >
      <MemoryRouter initialEntries={['/decision-environments/5/details']}>
        <Routes>
          <Route path="/decision-environments/:id/*" element={<DecisionEnvironmentPage />} />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('DecisionEnvironmentPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  beforeEach(() => {
    pageNavigate.mockClear();
    deleteDecisionEnvironment.mockClear();
    server.use(
      http.get(edaAPI`/decision-environments/5/`, () => HttpResponse.json(mockDecisionEnvironment)),
      http.options(edaAPI`/decision-environments/5/`, () => HttpResponse.json(mockOptions))
    );
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the title, breadcrumbs, and tabs', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Default DE' })).toBeInTheDocument();
    });
    expect(screen.getByText('Decision Environments')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Team Access' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User Access' })).toBeInTheDocument();
  });

  it('should enable edit and delete when the user can patch', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Default DE' })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Edit decision environment/i })
      ).not.toHaveAttribute('aria-disabled', 'true');
    });

    await user.click(screen.getByRole('button', { name: /Edit decision environment/i }));
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.EditDecisionEnvironment, {
      params: { id: 5 },
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await user.click(actionsDropdown);
    const deleteOption = await screen.findByRole('menuitem', { name: /delete/i });
    expect(deleteOption).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(deleteOption);
    expect(deleteDecisionEnvironment).toHaveBeenCalled();
  });

  it('should disable edit and delete when the user cannot patch', async () => {
    const user = userEvent.setup();
    server.use(
      http.options(edaAPI`/decision-environments/5/`, () =>
        HttpResponse.json({ actions: { GET: { name: { type: 'string' } } } })
      )
    );
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Default DE' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit decision environment/i })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    const actionsDropdown = screen.getByTestId('actions-dropdown');
    await user.click(actionsDropdown);
    const deleteOption = await screen.findByRole('menuitem', { name: /delete/i });
    expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
  });
});
