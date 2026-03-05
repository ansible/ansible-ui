import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypeDetailInner as CredentialTypeDetails } from './CredentialTypeDetails';

const mockCredentialType: CredentialType = {
  id: 5,
  type: 'credential_type',
  name: 'Amazon Web Services',
  description: '',
  kind: 'cloud',
  namespace: 'aws',
  managed: true,
  inputs: {
    fields: [
      { id: 'username', label: 'Access Key', type: 'string', secret: false, help_text: '' },
      { id: 'password', label: 'Secret Key', type: 'string', secret: true, help_text: '' },
    ],
    required: ['username', 'password'],
    metadata: [],
  },
  injectors: {
    env: '{"AWS_ACCESS_KEY_ID":"{{username}}","AWS_SECRET_ACCESS_KEY":"{{password}}"}',
  },
  related: {
    credentials: '/api/v2/credential_types/5/credentials/',
    activity_stream: '/api/v2/credential_types/5/activity_stream/',
  },
  summary_fields: {
    user_capabilities: { edit: false, delete: false },
  },
  created: '2023-01-01T00:00:00.000000Z',
  modified: '2023-01-01T00:00:00.000000Z',
};

describe('CredentialTypeDetails', () => {
  it('should render credential type details', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetails credentialType={mockCredentialType} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Amazon Web Services/)).toBeInTheDocument();
  });

  it('should display input configuration', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetails credentialType={mockCredentialType} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('input-configuration')).toBeInTheDocument();
  });

  it('should display injector configuration', () => {
    render(
      <MemoryRouter>
        <CredentialTypeDetails credentialType={mockCredentialType} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('injector-configuration')).toBeInTheDocument();
  });
});
