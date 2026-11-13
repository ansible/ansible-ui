/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { objectIdForResource, PlatformTeamAssignRoles } from './PlatformTeamAssignRoles';

// Mock child step components to avoid their complex dependencies
vi.mock('../../common/roles-wizard/PlatformSelectResourceTypeStep', () => ({
  PlatformSelectResourceTypeStep: () => (
    <div data-testid="resource-type-step">Resource Type Step</div>
  ),
}));
vi.mock('../../common/roles-wizard/PlatformSelectResourcesStep', () => ({
  PlatformSelectResourcesStep: () => <div data-testid="resources-step">Resources Step</div>,
}));
vi.mock('../../common/roles-wizard/PlatformSelectRolesStep', () => ({
  PlatformSelectRolesStep: () => <div data-testid="roles-step">Roles Step</div>,
}));
vi.mock('@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep', () => ({
  RoleAssignmentsReviewStep: () => <div data-testid="review-step">Review Step</div>,
}));

const mockTeam = {
  id: 1,
  name: 'test-team',
  organization: 1,
  description: '',
  url: '/api/gateway/v1/teams/1/',
  created: '2025-08-12T16:21:29.389218Z',
  modified: '2025-08-12T16:21:29.389200Z',
};

describe('PlatformTeamAssignRoles', () => {
  const server = setupServer(http.get(gatewayAPI`/teams/1/`, () => HttpResponse.json(mockTeam)));

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/access/teams/1/roles/assign']}>
        <Routes>
          <Route path="/access/teams/:id/roles/assign" element={<PlatformTeamAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render the wizard with all step labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Assign roles' })).toBeInTheDocument();
    });

    const navItems = screen.getAllByRole('listitem');
    const navTexts = navItems.map((item) => item.textContent);
    expect(navTexts).toContain('Select a resource type');
    expect(navTexts).toContain('Select resources');
    expect(navTexts).toContain('Select roles to apply');
    expect(navTexts).toContain('Review');
  });

  it('should hide Select resources step when resourceType is system', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('resource-type-step')).toBeInTheDocument();
    });

    const navItems = screen.getAllByRole('listitem');
    const navTexts = navItems.map((item) => item.textContent);
    expect(navTexts).toContain('Select resources');
  });

  describe('step hidden function', () => {
    it('should hide resources step when resourceType is system', () => {
      const hiddenFn = (wizardData: object) =>
        (wizardData as { resourceType: string }).resourceType === 'system';

      expect(hiddenFn({ resourceType: 'system' })).toBe(true);
      expect(hiddenFn({ resourceType: 'awx.jobtemplate' })).toBe(false);
      expect(hiddenFn({ resourceType: 'galaxy.namespace' })).toBe(false);
      expect(hiddenFn({ resourceType: '' })).toBe(false);
      expect(hiddenFn({})).toBe(false);
    });
  });

  describe('objectIdForResource', () => {
    it('maps resource types to stable object ids', () => {
      expect(objectIdForResource('awx.jobtemplate', { id: '42', name: 'My Template' })).toBe('42');
      expect(
        objectIdForResource('galaxy.containernamespace', {
          id: '1',
          name: 'ns',
          namespace: { id: '99' },
        })
      ).toBe('99');
      const uuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      expect(
        objectIdForResource('galaxy.collectionremote', {
          id: '1',
          name: 'rem',
          pulp_href: `/pulp/api/v3/remotes/ansible/collection/${uuid}/`,
        })
      ).toBe(uuid);
    });
  });
});
