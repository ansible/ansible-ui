import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationTeamsAddRoles } from './PlatformOrganizationTeamsAddRoles';

const wizardCapture = vi.hoisted(() => ({
  steps: [] as PageWizardStep[],
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: (props: { steps: PageWizardStep[] }) => {
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
    usePageNavigate: () => vi.fn(),
  };
});

describe('PlatformOrganizationTeamsAddRoles wizard steps', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
    http.get(gatewayAPI`/teams/`, () =>
      HttpResponse.json({ count: 0, results: [], next: null, previous: null })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('validates teams wizard step', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/assign-organization-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/assign-organization-roles"
            element={<PlatformOrganizationTeamsAddRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const teamsStep = wizardCapture.steps.find((step) => step.id === 'teams');
    expect(() => {
      if (!teamsStep || !('validate' in teamsStep) || !teamsStep.validate) {
        throw new Error('expected teams step');
      }
      void teamsStep.validate({}, {});
    }).toThrow(/Select at least one team/);
  });
});
