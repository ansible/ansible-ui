import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
import { SignatureKeys } from './SignatureKeys';

const mockSignatureKeysResponse = {
  count: 2,
  results: [
    {
      pulp_href: '/api/galaxy/pulp/api/v3/signing-services/123/',
      pulp_created: '2024-01-01T00:00:00.000000Z',
      name: 'test-key',
      pubkey_fingerprint: 'ABC123',
      public_key: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----',
    },
    {
      pulp_href: '/api/galaxy/pulp/api/v3/signing-services/456/',
      pulp_created: '2024-01-02T00:00:00.000000Z',
      name: 'another-key',
      pubkey_fingerprint: 'DEF456',
      public_key: '-----BEGIN PUBLIC KEY-----\nanother\n-----END PUBLIC KEY-----',
    },
  ],
};

const mockEmptyResponse = {
  count: 0,
  results: [],
};

function renderSignatureKeys() {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <SignatureKeys />
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('SignatureKeys Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/signing-services/`, () => HttpResponse.json(mockSignatureKeysResponse))
      );
    });

    it('should render page title', async () => {
      renderSignatureKeys();

      expect(await screen.findByRole('heading', { name: 'Signature Keys' })).toBeInTheDocument();
    });

    it('should render all column headers', async () => {
      renderSignatureKeys();

      await screen.findByRole('heading', { name: 'Signature Keys' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Fingerprint' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Public key' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument();
    });
  });

  describe('Signature Keys Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/signing-services/`, () => HttpResponse.json(mockSignatureKeysResponse))
      );
    });

    it('should render signature keys from API response', async () => {
      renderSignatureKeys();

      await screen.findByRole('heading', { name: 'Signature Keys' });

      expect(await screen.findByText('test-key')).toBeInTheDocument();
      expect(screen.getByText('another-key')).toBeInTheDocument();
    });

    it('should display fingerprint for each key', async () => {
      renderSignatureKeys();

      await screen.findByText('test-key');

      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('DEF456')).toBeInTheDocument();
    });

    it('should display public key content', async () => {
      renderSignatureKeys();

      await screen.findByText('test-key');

      const publicKeyCells = screen.getAllByText(/-----BEGIN PUBLIC KEY-----/);
      expect(publicKeyCells.length).toBeGreaterThanOrEqual(2);
    });

    it('should render download button for each key', async () => {
      renderSignatureKeys();

      await screen.findByText('test-key');

      const downloadButtons = screen.getAllByTestId('download-key');
      expect(downloadButtons).toHaveLength(2);
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(http.get(pulpAPI`/signing-services/`, () => HttpResponse.json(mockEmptyResponse)));
    });

    it('should show empty state when no signature keys exist', async () => {
      renderSignatureKeys();

      await screen.findByRole('heading', { name: 'Signature Keys' });

      await waitFor(() => {
        expect(screen.getByText('No signature keys')).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          'No signature keys have been created for your organization. If you require a key, contact your administrator.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render error state for 403 error', async () => {
      server.use(
        http.get(pulpAPI`/signing-services/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      renderSignatureKeys();

      await waitFor(() => {
        expect(screen.getByText('Error loading signature keys')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(pulpAPI`/signing-services/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      renderSignatureKeys();

      await screen.findByRole('heading', { name: 'Signature Keys' });

      await waitFor(() => {
        expect(screen.getByText('Error loading signature keys')).toBeInTheDocument();
      });
    });
  });
});
