/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaCredentialCell } from './EdaCredentialCell';

const mockCredential = {
  id: 5,
  name: 'My Test Credential',
  credential_type: { id: 1, name: 'Machine', kind: 'cloud' },
};

const server = setupServer(
  http.get('*/eda-credentials/5/', () => HttpResponse.json(mockCredential))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaCredentialCell', () => {
  it('should render credential name after loading', async () => {
    render(
      <MemoryRouter>
        <EdaCredentialCell eda_credential_id={5} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Test Credential')).toBeInTheDocument();
    });
  });

  it('should render credential id when data is not yet loaded', () => {
    server.use(
      http.get('*/eda-credentials/99/', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(
      <MemoryRouter>
        <EdaCredentialCell eda_credential_id={99} />
      </MemoryRouter>
    );

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('should render nothing when eda_credential_id is null', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaCredentialCell eda_credential_id={null} />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render nothing when eda_credential_id is undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaCredentialCell />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render with link by default', async () => {
    render(
      <MemoryRouter>
        <EdaCredentialCell eda_credential_id={5} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Test Credential')).toBeInTheDocument();
    });
  });

  it('should render without link when disableLink is true', async () => {
    render(
      <MemoryRouter>
        <EdaCredentialCell eda_credential_id={5} disableLink />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Test Credential')).toBeInTheDocument();
    });
  });
});
