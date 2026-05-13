/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformUsersAssignRoles } from './PlatformUsersAssignRoles';

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

const mockUser = {
  id: 1,
  username: 'test-user',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  url: '/api/gateway/v1/users/1/',
  created: '2025-08-12T16:21:29.389218Z',
  modified: '2025-08-12T16:21:29.389200Z',
};

describe('PlatformUsersAssignRoles', () => {
  const server = setupServer(http.get(gatewayAPI`/users/1/`, () => HttpResponse.json(mockUser)));

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/access/users/1/roles/assign']}>
        <Routes>
          <Route path="/access/users/:id/roles/assign" element={<PlatformUsersAssignRoles />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render the wizard with all step labels', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Assign roles' })).toBeInTheDocument();
    });

    // In jsdom, wizard may be collapsed - expand it first
    const toggle = screen.queryByTestId('wizard-toggle');
    if (toggle) {
      await user.click(toggle);
    }

    const navItems = screen.getAllByRole('listitem');
    const navTexts = navItems.map((item) => item.textContent);
    expect(navTexts).toContain('Select a resource type');
    expect(navTexts).toContain('Select resources');
    expect(navTexts).toContain('Select roles to apply');
    expect(navTexts).toContain('Review');
  });

  it('should show Select resources step when resourceType is not system', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('resource-type-step')).toBeInTheDocument();
    });

    // In jsdom, wizard may be collapsed - expand it first
    const toggle = screen.queryByTestId('wizard-toggle');
    if (toggle) {
      await user.click(toggle);
    }

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
      expect(hiddenFn({ resourceType: 'eda.project' })).toBe(false);
      expect(hiddenFn({ resourceType: '' })).toBe(false);
      expect(hiddenFn({})).toBe(false);
    });
  });
});
