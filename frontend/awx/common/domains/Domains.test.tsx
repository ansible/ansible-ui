import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Domains } from './Domains';
import { useDomainsStore } from './useDomains';

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => mockGet() as { data?: unknown },
}));

vi.mock('@ansible/common-ui/crud/usePutRequest', () => ({
  usePutRequest: () => mockPut,
}));

describe('Domains', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDomainsStore.setState({
      domains: [{ name: 'Network', labels: [{ name: 'network' }] }],
      userDomains: [{ name: 'Network', labels: [{ name: 'network' }] }],
      activeDomains: [],
    });
    mockGet.mockReturnValue({
      data: {
        name: 'domains',
        value: {
          domains: [{ name: 'Network', labels: [{ name: 'network' }] }],
          userDomains: [{ name: 'Network', labels: [{ name: 'network' }] }],
          activeDomains: [],
        },
      },
    });
    mockPut.mockResolvedValue({
      name: 'domains',
      value: {
        domains: [{ name: 'Network', labels: [{ name: 'network' }] }],
        userDomains: [{ name: 'Network', labels: [{ name: 'network' }] }],
        activeDomains: [{ name: 'Network', labels: [{ name: 'network' }] }],
      },
    });
  });

  test('should render Domains label', () => {
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    expect(screen.getByText('Domains')).toBeInTheDocument();
  });

  test('should render Configure Domains button', () => {
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    const configureButton = screen.getByRole('button', {
      name: /Configure Domains/i,
    });
    expect(configureButton).toBeInTheDocument();
  });

  test('persists an active-domain selection through the Gateway API', async () => {
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    const networkButton = await screen.findByRole('button', { name: 'Network' });
    fireEvent.click(networkButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/api/gateway/v1/me/preferences/domains/', {
        value: {
          domains: [{ name: 'Network', labels: [{ name: 'network' }] }],
          activeDomains: [{ name: 'Network', labels: [{ name: 'network' }] }],
        },
      });
    });
  });
});
