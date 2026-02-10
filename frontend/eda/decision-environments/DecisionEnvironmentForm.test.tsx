import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { CreateDecisionEnvironment } from './DecisionEnvironmentForm';

const mockOptionsResponse = {
  name: 'Decision Environment List',
  description: '',
  renders: ['application/json', 'text/html'],
  parses: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
  actions: {
    POST: {
      name: {
        type: 'string',
        required: true,
        read_only: false,
        label: 'Name',
      },
      description: {
        type: 'string',
        required: false,
        read_only: false,
        label: 'Description',
      },
      image_url: {
        type: 'string',
        required: true,
        read_only: false,
        label: 'Image url',
      },
      pull_policy: {
        type: 'choice',
        required: false,
        read_only: false,
        label: 'Pull policy',
        choices: [
          { value: 'always', display_name: 'Always' },
          { value: 'missing', display_name: 'If not present' },
          { value: 'never', display_name: 'Never' },
        ],
      },
      organization_id: {
        type: 'field',
        required: false,
        read_only: true,
        label: 'Organization id',
      },
      eda_credential_id: {
        type: 'field',
        required: false,
        read_only: true,
        label: 'Eda credential id',
      },
    },
  },
};

const server = setupServer(
  http.get(edaAPI`/organizations/**`, () => {
    return HttpResponse.json({
      results: [
        { id: 1, name: 'Default' },
        { id: 2, name: 'Organization 2' },
      ],
    });
  }),
  http.get(edaAPI`/eda-credentials/**`, () => {
    return HttpResponse.json({
      results: [],
    });
  }),
  http.options(edaAPI`/decision-environments/`, () => {
    return HttpResponse.json(mockOptionsResponse);
  })
);

describe('Create Decision Environment Form', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the create form with correct title, breadcrumbs and action buttons', async () => {
    render(
      <MemoryRouter>
        <CreateDecisionEnvironment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Create decision environment/i })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumb).toBeInTheDocument();

    const breadcrumbItems = screen.getAllByRole('listitem');
    expect(breadcrumbItems).toHaveLength(2);

    expect(breadcrumbItems[0]).toHaveTextContent('Decision Environments');
    expect(breadcrumbItems[1]).toHaveTextContent('Create decision environment');

    expect(
      screen.getByRole('button', { name: /Create decision environment/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('should render all form fields and mark required fields correctly', async () => {
    render(
      <MemoryRouter>
        <CreateDecisionEnvironment />
      </MemoryRouter>
    );

    await waitFor(
      () => expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument(),
      {
        timeout: 5000,
      }
    );

    expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Description/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Organization/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pull/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Credential/i })).toBeInTheDocument();

    expect(within(screen.getByTestId('name-form-group')).getByText('*')).toBeInTheDocument();
    expect(within(screen.getByTestId('image-url-form-group')).getByText('*')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('organization_id-form-group')).getByText('*')
    ).toBeInTheDocument();
  });
});
