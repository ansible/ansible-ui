import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { DecisionEnvironments } from './DecisionEnvironments';

const mockDecisionEnvironments = [
  {
    id: 1,
    name: 'Decision Environment Alpha',
    description: 'Test description for Alpha',
    image_url: 'quay.io/ansible/ansible-rulebook:alpha',
    organization_id: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    modified_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Decision Environment Beta',
    description: 'Test description for Beta',
    image_url: 'quay.io/ansible/ansible-rulebook:beta',
    organization_id: 1,
    created_at: '2024-01-02T00:00:00.000Z',
    modified_at: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Production Environment',
    description: 'Production decision environment',
    image_url: 'quay.io/ansible/ansible-rulebook:prod',
    organization_id: 1,
    created_at: '2024-01-03T00:00:00.000Z',
    modified_at: '2024-01-03T00:00:00.000Z',
  },
];

const mockOptionsResponse = {
  actions: {
    POST: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      image_url: { type: 'string', required: true },
    },
    GET: {},
  },
};

describe('DecisionEnvironments - List and Filtering', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render decision environments list view', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json({
          count: mockDecisionEnvironments.length,
          results: mockDecisionEnvironments,
        });
      }),
      http.options(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json(mockOptionsResponse);
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision Environments')).toBeVisible();
    });

    expect(
      screen.getByText('Decision environments are a container image to run Ansible rulebooks.')
    ).toBeVisible();

    await waitFor(() => {
      expect(screen.getByText('Decision Environment Alpha')).toBeVisible();
    });
    expect(screen.getByText('Decision Environment Beta')).toBeVisible();
    expect(screen.getByText('Production Environment')).toBeVisible();
  });

  test('should display empty state when no decision environments exist', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json({
          count: 0,
          results: [],
        });
      }),
      http.options(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json(mockOptionsResponse);
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are currently no decision environments created for your organization.'
        )
      ).toBeVisible();
    });

    expect(
      screen.getByText('Please create a decision environment by using the button below.')
    ).toBeVisible();
  });

  test('should display no permission message when user cannot create decision environments', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json({
          count: 0,
          results: [],
        });
      }),
      http.options(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json({
          actions: {
            GET: {},
          },
        });
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to create a decision environment.')
      ).toBeVisible();
    });

    expect(
      screen.getByText(
        'Please contact your organization administrator if there is an issue with your access.'
      )
    ).toBeVisible();
  });

  test('should display filtered Decision Environment list when filter param is provided', async () => {
    const testDE = mockDecisionEnvironments[0];

    server.use(
      http.get(edaAPI`/decision-environments/`, ({ request }) => {
        const url = new URL(request.url);
        const nameFilter = url.searchParams.get('name__icontains');

        if (nameFilter) {
          const filtered = mockDecisionEnvironments.filter((de) =>
            de.name.toLowerCase().includes(nameFilter.toLowerCase())
          );
          return HttpResponse.json({
            count: filtered.length,
            results: filtered,
          });
        }

        return HttpResponse.json({
          count: 1,
          results: [testDE],
        });
      }),
      http.options(edaAPI`/decision-environments/`, () => {
        return HttpResponse.json(mockOptionsResponse);
      })
    );

    render(
      <MemoryRouter>
        <DecisionEnvironments />
      </MemoryRouter>
    );

    // Verify only the filtered result appears
    await waitFor(() => {
      expect(screen.getByText(testDE.name)).toBeVisible();
    });

    // Verify other results are not visible
    const otherDEs = mockDecisionEnvironments.filter((de) => de.id !== testDE.id);
    otherDEs.forEach((de) => {
      expect(screen.queryByText(de.name)).not.toBeInTheDocument();
    });
  });
});
