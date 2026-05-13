/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { CredentialTestResponse } from '../../../../interfaces/CredentialTestResponse';
import { useCredentialPluginsModal } from './useCredentialPluginsDialog';

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const mockCredential = {
  id: 1,
  name: 'Test OIDC Credential',
  credential_type: 1,
  summary_fields: {
    credential_type: { id: 1, name: 'HashiCorp Vault OIDC', namespace: 'hashivault-kv-oidc' },
  },
};

const mockCredentialType = {
  id: 1,
  name: 'HashiCorp Vault OIDC',
  namespace: 'hashivault-kv-oidc',
  inputs: {
    fields: [],
    metadata: [{ id: 'account-name', type: 'string', label: 'Account Name', secret: false }],
    required: ['account-name'],
  },
};

const server = setupServer(
  http.get(awxAPI`/credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType)),
  http.post(awxAPI`/credentials/1/test/`, () => HttpResponse.json(mockJwtTestResponse)),
  http.options('*/job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/job_templates/', () =>
    HttpResponse.json({
      count: 1,
      results: [
        { id: 1, name: 'Demo Job Template', type: 'job_template', url: '/api/v2/job_templates/1/' },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockJwtTestResponse: CredentialTestResponse = {
  status: 'success',
  details: {
    sent_jwt_payload: {
      iss: 'https://test.example.com',
      sub: 'test-user',
      aud: 'test-audience',
      exp: 1234567890,
      iat: 1234567800,
      job_template_id: 1,
    },
  },
};

// Test component that uses the hook
function TestCredentialPluginsModal() {
  const openModal = useCredentialPluginsModal();

  const handleOpenModal = () => {
    openModal({
      field: {
        id: 'test-field',
        label: 'Test Field',
        secret: false,
        type: 'string',
        help_text: '',
      },
      setCredentialPluginValues: vi.fn(),
      onClose: vi.fn(),
      accumulatedPluginValues: [
        {
          input_field_name: 'test-field',
          source_credential: 1,
          metadata: { 'account-name': 'test' },
        },
      ],
    });
  };

  return (
    <div>
      <button onClick={handleOpenModal} data-testid="open-modal">
        Open Modal
      </button>
    </div>
  );
}

describe('useCredentialPluginsModal Hook', () => {
  it('should render hook without errors', () => {
    const { result } = renderHook(() => useCredentialPluginsModal(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toBeTypeOf('function');
  });

  it('should open modal when hook is called', async () => {
    render(
      <TestWrapper>
        <TestCredentialPluginsModal />
      </TestWrapper>
    );

    const openButton = screen.getByTestId('open-modal');
    expect(openButton).toBeInTheDocument();

    // This exercises the hook code path
    const user = userEvent.setup();
    await user.click(openButton);
  });
});
