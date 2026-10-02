/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaOrganizationCell } from './EdaOrganizationCell';

const mockOrganization = {
  id: 5,
  name: 'Default Organization',
  description: 'The default org',
};

const server = setupServer(
  http.get(edaAPI`/organizations/5/`, () => HttpResponse.json(mockOrganization))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaOrganizationCell', () => {
  it('should render organization name when organization_id is provided', async () => {
    render(
      <MemoryRouter>
        <EdaOrganizationCell organization_id={5} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });

  it('should render the numeric id while data is loading', () => {
    server.use(
      http.get(edaAPI`/organizations/99/`, async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockOrganization);
      })
    );

    render(
      <MemoryRouter>
        <EdaOrganizationCell organization_id={99} />
      </MemoryRouter>
    );

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('should render nothing when organization_id is null', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaOrganizationCell organization_id={null} />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render nothing when organization_id is undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaOrganizationCell />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render organization name as a link', async () => {
    render(
      <MemoryRouter>
        <EdaOrganizationCell organization_id={5} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
  });
});
