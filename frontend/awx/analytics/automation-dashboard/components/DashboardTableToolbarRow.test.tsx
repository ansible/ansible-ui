/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';
import type { DashboardTableToolbarProps, ISubscriptionCosts } from '../types';

// ─── MSW server ───────────────────────────────────────────────────────────────

let requestedOrganization: string | null = null;
const server = setupServer(
  http.put(/subscription_costs/, async ({ request }) => {
    requestedOrganization = new URL(request.url).searchParams.get('organization');
    return HttpResponse.json(await request.json());
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultCostState: ISubscriptionCosts = {
  id: 1,
  monthly_subscription_cost: 100,
  engineer_avg_hourly_rate: 50,
  include_template_creation_time_in_costs: false,
};

const mockSetCostState = vi.fn();
const mockRefresh = vi.fn();

function buildProps(
  overrides: Partial<DashboardTableToolbarProps> = {}
): DashboardTableToolbarProps {
  return {
    costState: defaultCostState,
    setCostState: mockSetCostState,
    useGlobalSettings: false,
    settingsOrganizationId: 1,
    canEditSettings: true,
    refresh: mockRefresh,
    ...overrides,
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </MemoryRouter>
  );
}

function renderRow(props: DashboardTableToolbarProps = buildProps()) {
  return render(<DashboardTableToolbarRow {...props} />, { wrapper: Wrapper });
}

async function triggerInputChange(testId: string, value: string) {
  const user = userEvent.setup();
  const input = screen.getByTestId(testId);
  await user.clear(input);
  await user.type(input, value);
  await user.tab();
  return { user, input };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardTableToolbarRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestedOrganization = null;
    mockRefresh.mockResolvedValue(undefined);
  });

  // --- Rendering ---

  test('should render all inputs and switch', () => {
    renderRow();
    expect(screen.getByTestId('engineer_avg_hourly_rate')).toBeInTheDocument();
    expect(screen.getByTestId('monthly_subscription_cost')).toBeInTheDocument();
    expect(screen.getByTestId('switch-time-taken-automation-toggle')).toBeInTheDocument();
  });

  test('should display initial values from costState', () => {
    renderRow();
    expect(screen.getByTestId('engineer_avg_hourly_rate')).toHaveValue(50);
    expect(screen.getByTestId('monthly_subscription_cost')).toHaveValue(100);
  });

  test('should show switch as checked when include_template_creation_time_in_costs is true', () => {
    renderRow(
      buildProps({
        costState: { ...defaultCostState, include_template_creation_time_in_costs: true },
      })
    );
    expect(screen.getByTestId('switch-time-taken-automation-toggle')).toBeChecked();
  });

  test('should show switch as unchecked when include_template_creation_time_in_costs is false', () => {
    renderRow();
    expect(screen.getByTestId('switch-time-taken-automation-toggle')).not.toBeChecked();
  });

  test('should render without crashing when costState is undefined', () => {
    renderRow(buildProps({ costState: undefined }));
    expect(screen.getByTestId('monthly_subscription_cost')).toBeInTheDocument();
  });

  // --- Inputs disabled ---
  test('should disable cost inputs and switch when the selected organization is read-only', () => {
    renderRow(buildProps({ canEditSettings: false }));
    expect(screen.getByTestId('engineer_avg_hourly_rate')).toBeDisabled();
    expect(screen.getByTestId('monthly_subscription_cost')).toBeDisabled();
    expect(screen.getByTestId('switch-time-taken-automation-toggle')).toBeDisabled();
  });

  test('should disable settings controls when no organization is selected', () => {
    renderRow(buildProps({ settingsOrganizationId: undefined }));
    expect(screen.getByTestId('engineer_avg_hourly_rate')).toBeDisabled();
    expect(screen.getByTestId('monthly_subscription_cost')).toBeDisabled();
    expect(screen.getByTestId('switch-time-taken-automation-toggle')).toBeDisabled();
  });

  // --- toolbarChangeHandler: success ---

  test('should show success alert, call setCostState and refresh on engineer_avg_hourly_rate change', async () => {
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() =>
      expect(screen.getByText(/Subscription costs updated successfully/i)).toBeInTheDocument()
    );
    expect(requestedOrganization).toBe('1');
    expect(mockSetCostState).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  test('should preserve unscoped writes for global settings', async () => {
    renderRow(buildProps({ useGlobalSettings: true, settingsOrganizationId: undefined }));
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() =>
      expect(screen.getByText(/Subscription costs updated successfully/i)).toBeInTheDocument()
    );

    expect(requestedOrganization).toBeNull();
  });

  test('should show success alert on monthly_subscription_cost change', async () => {
    renderRow();
    await triggerInputChange('monthly_subscription_cost', '200');
    await waitFor(() =>
      expect(screen.getByText(/Subscription costs updated successfully/i)).toBeInTheDocument()
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  test('should show success alert when switch is toggled', async () => {
    const user = userEvent.setup();
    renderRow();
    await user.click(screen.getByTestId('switch-time-taken-automation-toggle'));
    await waitFor(() =>
      expect(screen.getByText(/Subscription costs updated successfully/i)).toBeInTheDocument()
    );
    expect(mockSetCostState).toHaveBeenCalled();
  });

  test('should skip setCostState call when setCostState is undefined', async () => {
    renderRow(buildProps({ setCostState: undefined }));
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() =>
      expect(screen.getByText(/Subscription costs updated successfully/i)).toBeInTheDocument()
    );
    expect(mockSetCostState).not.toHaveBeenCalled();
  });

  // --- toolbarChangeHandler: network error ---

  test('should show danger alert and not call refresh on network error', async () => {
    server.use(http.put(/subscription_costs/, () => HttpResponse.error()));
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() =>
      expect(screen.getByText(/Failed to update subscription costs/i)).toBeInTheDocument()
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('should show warning alert when refresh fails after successful post', async () => {
    mockRefresh.mockRejectedValueOnce(new Error('Network error'));
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() =>
      expect(screen.getByText(/Update saved but failed to refresh view/i)).toBeInTheDocument()
    );
  });

  // --- toolbarChangeHandler: 422 field error ---

  test('should display field error in input on 422 response', async () => {
    server.use(
      http.put(/subscription_costs/, () =>
        HttpResponse.json(
          { engineer_avg_hourly_rate: ['Value must be positive.'] },
          { status: 422 }
        )
      )
    );
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() => expect(screen.getByText('Value must be positive.')).toBeInTheDocument());
  });

  test('should clear field error on next successful request', async () => {
    server.use(
      http.put(
        /subscription_costs/,
        () => HttpResponse.json({ engineer_avg_hourly_rate: ['Too high'] }, { status: 422 }),
        { once: true }
      )
    );
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() => expect(screen.getByText('Too high')).toBeInTheDocument());

    await triggerInputChange('engineer_avg_hourly_rate', '60');
    await waitFor(() => expect(screen.queryByText('Too high')).not.toBeInTheDocument());
  });
});
