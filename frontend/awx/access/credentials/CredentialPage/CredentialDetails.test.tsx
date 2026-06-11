import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { CredentialDetailsInner as CredentialDetails } from './CredentialDetails';

const mockCredential: Credential = {
  id: 2,
  type: 'credential',
  url: '/api/v2/credentials/2/',
  name: 'Ansible Galaxy',
  description: '',
  organization: null,
  credential_type: 18,
  credential_type__namespace: 'galaxy_api_token',
  credential_type__kind: 'cloud',
  managed: true,
  kind: 'galaxy_api_token',
  cloud: false,
  kubernetes: false,
  inputs: { url: 'https://galaxy.ansible.com/' },
  summary_fields: {
    credential_type: {
      id: 18,
      name: 'Ansible Galaxy/Automation Hub API Token',
      description: '',
    },
    user_capabilities: { edit: true, delete: true, copy: true, use: true },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    object_roles: {
      admin_role: { id: 23, name: 'Admin', description: '' },
      read_role: { id: 25, name: 'Read', description: '' },
      use_role: { id: 24, name: 'Use', description: '' },
    },
    owners: [],
  },
  related: {},
  created: '2022-12-09T15:26:49.544132Z',
  modified: '2022-12-09T15:26:49.544146Z',
};

const mockCredentialType = {
  id: 18,
  type: 'credential_type',
  name: 'Ansible Galaxy/Automation Hub API Token',
  namespace: 'galaxy_api_token',
  kind: 'cloud',
  inputs: {
    fields: [{ id: 'url', label: 'Galaxy Server URL', type: 'string' }],
  },
};

const server = setupServer(
  http.get(awxAPI`/credential_types/*`, () => {
    return HttpResponse.json(mockCredentialType);
  }),
  http.get(awxAPI`/credentials/2/input_sources/`, () => {
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialDetails', () => {
  it('should render credential details', async () => {
    render(
      <MemoryRouter>
        <CredentialDetails credential={mockCredential} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ansible Galaxy')).toBeInTheDocument();
    });
  });
});
