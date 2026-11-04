import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialTypeDetailInner } from './CredentialTypeDetails';

const mockCredentialType = {
  id: 1,
  name: 'Cloud Type',
  description: 'desc',
  managed: true,
  inputs: { fields: [] },
  injectors: {},
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
  summary_fields: {
    created_by: { id: 5, username: 'creator' },
    modified_by: { id: 6, username: 'editor' },
  },
};

const server = setupServer(
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialTypeDetails', () => {
  it('renders managed credential type details with read-only label', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetailInner credentialType={mockCredentialType} />
      </MemoryRouter>
    );

    expect(screen.getByText('Cloud Type')).toBeInTheDocument();
    expect(screen.getByText('Read-only')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
  });

  it('renders unmanaged credential type name without read-only label', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetailInner
          credentialType={{ ...mockCredentialType, managed: false, name: 'Editable' }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Editable')).toBeInTheDocument();
    expect(screen.queryByText('Read-only')).not.toBeInTheDocument();
  });
});
