/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionDetails } from './SubscriptionDetails';

const server = setupServer();

const mockLicenseInfo = vi.hoisted(() => ({
  subscription_name: 'Enterprise Subscription',
  license_type: 'enterprise' as string,
  compliant: true,
  valid_key: true,
  trial: false,
  time_remaining: 86400 * 30,
  automated_instances: 0,
  current_instances: 0,
  free_instances: 0,
  deleted_instances: 0,
  reactivated_instances: 0,
}));

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfig: () => ({
    license_info: mockLicenseInfo,
  }),
}));

const mockUsePlatformActiveUser = vi.hoisted(() =>
  vi.fn(() => ({ activePlatformUser: { is_superuser: true } }))
);

vi.mock('../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: mockUsePlatformActiveUser,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SubscriptionDetails', () => {
  beforeEach(() => {
    mockLicenseInfo.license_type = 'enterprise';
    mockLicenseInfo.compliant = true;
    mockLicenseInfo.trial = false;
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: { is_superuser: true } });
  });

  it('exports the SubscriptionDetails component', () => {
    expect(SubscriptionDetails).toBeDefined();
    expect(typeof SubscriptionDetails).toBe('function');
  });

  it('should render subscription details when system settings load', async () => {
    server.use(
      http.get(awxAPI`/settings/system/`, () =>
        HttpResponse.json({ CUSTOM_LICENSE_INFO: {}, LICENSE: {} })
      )
    );

    render(
      <MemoryRouter>
        <SubscriptionDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Subscription Settings')).toBeInTheDocument();
    });
    expect(screen.getByText('Enterprise Subscription')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('should show trial license type and out of compliance status', async () => {
    mockLicenseInfo.license_type = 'trial';
    mockLicenseInfo.compliant = false;

    server.use(
      http.get(awxAPI`/settings/system/`, () =>
        HttpResponse.json({
          SUBSCRIPTION_USAGE_MODEL: 'unique_managed_hosts',
          CUSTOM_LICENSE_INFO: {},
          LICENSE: {},
        })
      )
    );

    render(
      <MemoryRouter>
        <SubscriptionDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Out of compliance')).toBeInTheDocument();
    });
    expect(screen.getByText('Hosts automated')).toBeInTheDocument();
    expect(screen.getAllByText('Trial').length).toBeGreaterThanOrEqual(1);
  });

  it('should mark edit subscription as disabled for non-superusers', async () => {
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: { is_superuser: false } });

    server.use(
      http.get(awxAPI`/settings/system/`, () =>
        HttpResponse.json({ CUSTOM_LICENSE_INFO: {}, LICENSE: {} })
      )
    );

    render(
      <MemoryRouter>
        <SubscriptionDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit subscription' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});
