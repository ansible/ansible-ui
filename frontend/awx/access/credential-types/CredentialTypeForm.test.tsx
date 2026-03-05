import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
  const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
    <textarea
      id={props.id as string}
      name={props.id as string}
      value={props.value as string}
      onChange={props.onChange as () => void}
      data-testid={props.id as string}
    />
  ));
  return { DataEditor: FakeDataEditor };
});

const mockCredentialType = {
  id: 1,
  name: 'Mock Credential Type',
  description: 'mock credential type description',
  kind: 'cloud',
  inputs: { fields: [], required: [] },
  injectors: {},
  summary_fields: { user_capabilities: { edit: true, delete: true } },
};

const server = setupServer(
  http.options(awxAPI`/credential_types/`, () => HttpResponse.json({})),
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType)),
  http.post(awxAPI`/credential_types/`, () =>
    HttpResponse.json(mockCredentialType, { status: 201 })
  ),
  http.patch(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => vi.clearAllMocks());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialTypeForm', () => {
  describe('CreateCredentialType', () => {
    it('should render create credential type form with title', async () => {
      render(
        <MemoryRouter>
          <CreateCredentialType />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential type');
      });
    });

    it('should display name input field', async () => {
      render(
        <MemoryRouter>
          <CreateCredentialType />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toBeInTheDocument();
      });
    });

    it('should display description input field', async () => {
      render(
        <MemoryRouter>
          <CreateCredentialType />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('description')).toBeInTheDocument();
      });
    });
  });

  describe('EditCredentialType', () => {
    it('should render edit credential type form with title', async () => {
      render(
        <MemoryRouter initialEntries={['/credential-types/1/edit']}>
          <Routes>
            <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Mock Credential Type');
      });
    });

    it('should preload form with current values', async () => {
      render(
        <MemoryRouter initialEntries={['/credential-types/1/edit']}>
          <Routes>
            <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Mock Credential Type');
      });

      expect(screen.getByTestId('description')).toHaveValue('mock credential type description');
    });
  });
});
