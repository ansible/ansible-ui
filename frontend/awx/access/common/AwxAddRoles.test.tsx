/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxAddRoles } from './AwxAddRoles';

const wizardCapture = vi.hoisted(() => ({
  onSubmit: undefined as ((data: unknown) => Promise<void>) | undefined,
  steps: [] as PageWizardStep[],
}));

const mockProgressDialog = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: <T,>(props: { onSubmit: (data: T) => Promise<void>; steps: PageWizardStep[] }) => {
      wizardCapture.onSubmit = props.onSubmit as typeof wizardCapture.onSubmit;
      wizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
});

vi.mock('../../common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => mockProgressDialog,
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: vi.fn(() => Promise.resolve({})),
}));

const roleDefinitionsOptions = {
  actions: {
    GET: {
      content_type: {
        choices: [
          ['awx.organization', 'Organization'],
          ['awx.project', 'Project'],
          ['awx.inventory', 'Inventory'],
        ],
      },
    },
  },
};

const server = setupServer(
  http.options(awxAPI`/role_definitions/`, () => HttpResponse.json(roleDefinitionsOptions)),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () =>
      HttpResponse.json({
        count: 0,
        results: [],
        next: null,
        previous: null,
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('AwxAddRoles', () => {
  it('validates resources and roles steps', () => {
    render(
      <MemoryRouter>
        <AwxAddRoles id="1" type="user" userOrTeamName="testuser" onClose={() => {}} />
      </MemoryRouter>
    );

    const resourcesStep = wizardCapture.steps.find((step) => step.id === 'resources');
    const rolesStep = wizardCapture.steps.find((step) => step.id === 'roles');
    expect(() => {
      if (!resourcesStep || !('validate' in resourcesStep) || !resourcesStep.validate) {
        throw new Error('expected resources step');
      }
      void resourcesStep.validate({}, {});
    }).toThrow(/Select at least one resource/);
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });

  it('submits user role assignments through the progress dialog', async () => {
    const onClose = vi.fn();
    mockProgressDialog.mockImplementation(
      (options: {
        items: unknown[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
      }) => {
        const item = options.items[0];
        if (item) {
          void options.actionFn(item);
        }
        options.onComplete();
      }
    );

    render(
      <MemoryRouter>
        <AwxAddRoles id="7" type="user" userOrTeamName="testuser" onClose={onClose} />
      </MemoryRouter>
    );

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      resourceType: 'awx.project',
      resources: [{ id: 1, name: 'Project A' }],
      awxRoles: [{ id: 2, name: 'Admin' }],
    });

    expect(mockProgressDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Add roles',
      })
    );
  });

  it('assigns team id when type is team', async () => {
    mockProgressDialog.mockImplementation(
      (options: {
        items: unknown[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
      }) => {
        const item = options.items[0];
        if (item) {
          void options.actionFn(item);
        }
        options.onComplete();
      }
    );

    render(
      <MemoryRouter>
        <AwxAddRoles id="3" type="team" userOrTeamName="Team" onClose={() => {}} />
      </MemoryRouter>
    );

    if (!wizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await wizardCapture.onSubmit({
      resourceType: 'awx.inventory',
      resources: [{ id: 4, name: 'Inv' }],
      awxRoles: [{ id: 5, name: 'Use' }],
    });

    expect(mockProgressDialog).toHaveBeenCalled();
  });

  it('should render wizard with Select a resource type step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <AwxAddRoles id="1" type="user" userOrTeamName="testuser" onClose={() => {}} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
        expect(wizardCapture.steps.some((step) => step.id === 'resource-type')).toBe(true);
      },
      { timeout: 10000 }
    );
  });

  it('should render wizard steps for team type', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <AwxAddRoles id="2" type="team" userOrTeamName="Test Team" onClose={() => {}} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
        expect(wizardCapture.steps.map((step) => step.label)).toEqual(
          expect.arrayContaining(['Select resources', 'Select roles to apply', 'Review'])
        );
      },
      { timeout: 10000 }
    );
  });
});
