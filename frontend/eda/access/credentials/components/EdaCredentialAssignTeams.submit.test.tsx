import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaCredentialAssignTeams } from './EdaCredentialAssignTeams';

const wizardCapture = vi.hoisted(() => ({
  onSubmit: undefined as ((data: unknown) => Promise<void>) | undefined,
  onCancel: undefined as (() => void) | undefined,
  steps: [] as PageWizardStep[],
}));
const progressDialog = vi.hoisted(() => vi.fn());
const pageNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
    PageWizard: <T,>(props: {
      onSubmit: (data: T) => Promise<void>;
      onCancel: () => void;
      steps: PageWizardStep[];
    }) => {
      wizardCapture.onSubmit = props.onSubmit as typeof wizardCapture.onSubmit;
      wizardCapture.onCancel = props.onCancel;
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
});

vi.mock('../../../common/useEdaBulkActionDialog', () => ({
  useEdaBulkActionDialog: () => progressDialog,
}));

const server = setupServer(
  http.get(edaAPI`/eda-credentials/42/`, () =>
    HttpResponse.json({ id: 42, name: 'Test Credential' })
  ),
  http.post('*/role_team_assignments/', () => HttpResponse.json({ id: 1 }, { status: 201 }))
);

function step(id: string) {
  const found = wizardCapture.steps.find((item) => item.id === id);
  if (!found || !('validate' in found) || !found.validate) {
    throw new Error(`Missing step ${id}`);
  }
  return found;
}

describe('EdaCredentialAssignTeams submit', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() => {
    pageNavigate.mockClear();
    progressDialog.mockReset();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('validates teams and roles, then posts team assignments', async () => {
    progressDialog.mockImplementation(
      (options: {
        items: { team: { id: number; name: string }; role: { id: number; name: string } }[];
        keyFn: (item: { team: { id: number }; role: { id: number } }) => string;
        actionColumns: {
          cell: (item: { team: { name: string }; role: { name: string } }) => string;
        }[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
        onClose: () => void;
      }) => {
        expect(options.keyFn(options.items[0])).toBe('6_3');
        expect(options.actionColumns[0].cell(options.items[0])).toBe('Operators');
        expect(options.actionColumns[1].cell(options.items[0])).toBe('Admin');
        options.actionFn(options.items[0]);
        options.onComplete();
        options.onClose();
      }
    );

    render(
      <MemoryRouter initialEntries={['/credentials/42/team-access/assign-teams']}>
        <Routes>
          <Route
            path="/credentials/:id/team-access/assign-teams"
            element={<EdaCredentialAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('wizard-capture')).toBeInTheDocument());

    expect(() => {
      void step('teams').validate?.({}, {});
    }).toThrow(/Select at least one team/);
    expect(() => {
      void step('teams').validate?.({ teams: [{ id: 6, name: 'Operators' }] }, {});
    }).not.toThrow();
    expect(() => {
      void step('platformRoles').validate?.({}, {});
    }).toThrow(/Select at least one role/);

    await wizardCapture.onSubmit?.({
      teams: [{ id: 6, name: 'Operators' }],
      platformRoles: [{ id: 3, name: 'Admin' }],
    });

    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.CredentialTeamAccess, {
      params: { id: '42' },
    });

    pageNavigate.mockClear();
    wizardCapture.onCancel?.();
    expect(pageNavigate).toHaveBeenCalledWith(EdaRoute.CredentialTeamAccess, {
      params: { id: 42 },
    });
  });
});
