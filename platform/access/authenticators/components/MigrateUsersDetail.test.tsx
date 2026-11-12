import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { Authenticator } from '../../../interfaces/Authenticator';
import { MigrateUsersToDetail } from './MigrateUsersDetail';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...mod,
    useGetPageUrl: () => (_route: unknown, opts: { params: { id: string } }) =>
      `/access/authenticators/details/${opts.params.id}`,
  };
});

describe('MigrateUsersToDetail', () => {
  const targetAuthenticator: Partial<Authenticator> = {
    id: 7,
    name: 'Migration target authenticator',
  };

  const server = setupServer(
    http.get(gatewayAPI`/authenticators/7/`, () =>
      HttpResponse.json(targetAuthenticator as Authenticator)
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches and shows the linked authenticator name when autoMigrateUsersTo is a number', async () => {
    render(<MigrateUsersToDetail autoMigrateUsersTo={7} isLegacy={false} />);

    await waitFor(() => {
      expect(screen.getByText('Migration target authenticator')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: 'Migration target authenticator' });
    expect(link).toHaveAttribute('href', '/access/authenticators/details/7');
  });

  it('shows legacy migrate-to label when isLegacy is true', async () => {
    render(<MigrateUsersToDetail autoMigrateUsersTo={7} isLegacy />);

    await waitFor(() => {
      expect(screen.getByText('Automatically migrate legacy users to')).toBeInTheDocument();
    });
  });

  it('renders multiple legacy source authenticators when passed as an array', () => {
    const sources = [
      { id: 10, name: 'Legacy A' },
      { id: 11, name: 'Legacy B' },
    ] as unknown as Authenticator[];
    render(<MigrateUsersToDetail isLegacy={false} autoMigrateUsersTo={sources} />);

    expect(screen.getByText('Automatically migrate legacy users from')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Legacy A' })).toHaveAttribute(
      'href',
      '/access/authenticators/details/10'
    );
    expect(screen.getByRole('link', { name: 'Legacy B' })).toHaveAttribute(
      'href',
      '/access/authenticators/details/11'
    );
  });

  it('returns null when there is no migrate selection', () => {
    const { container } = render(<MigrateUsersToDetail isLegacy={false} />);
    expect(container.firstChild).toBeNull();
  });
});
