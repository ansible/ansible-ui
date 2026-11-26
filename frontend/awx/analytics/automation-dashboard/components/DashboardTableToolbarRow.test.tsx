import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { DashboardTableToolbarRow } from './DashboardTableToolbarRow';
import type { DashboardTableToolbarProps, ISubscriptionCosts } from '../types';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseAwxActiveUser } = vi.hoisted(() => ({
  mockUseAwxActiveUser: vi.fn(),
}));

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.put(/subscription_costs/, async ({ request }) => HttpResponse.json(await request.json()))
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

const ADMIN_ONLY_REASON = 'Only administrators can change cost settings';
const SWITCH_LABEL = 'Include time taken to create automation in calculations';
const getSwitch = () => screen.getByTestId('switch-time-taken-automation-toggle');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardTableToolbarRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefresh.mockResolvedValue(undefined);
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: true } });
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
  test('should make cost inputs read-only and disable the switch when not superuser', () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    renderRow();
    // Read-only instead of disabled, so the fields can be focused to show the reason.
    for (const testId of ['engineer_avg_hourly_rate', 'monthly_subscription_cost']) {
      const input = screen.getByTestId(testId);
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('readonly');
    }
    expect(getSwitch()).toBeDisabled();
  });

  test('should disable cost inputs and switch without a reason while loading as superuser', async () => {
    const user = userEvent.setup();
    renderRow(buildProps({ costState: undefined }));
    const input = screen.getByTestId('engineer_avg_hourly_rate');
    expect(input).toBeDisabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(getSwitch()).toBeDisabled();
    expect(getSwitch()).not.toHaveAccessibleDescription();
    await user.hover(input);
    expect(screen.queryByText(ADMIN_ONLY_REASON)).toBeNull();
  });

  test('should disable cost inputs and switch without a reason while the user loads', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: undefined });
    const user = userEvent.setup();
    renderRow();
    const input = screen.getByTestId('engineer_avg_hourly_rate');
    expect(input).toBeDisabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(getSwitch()).toBeDisabled();
    expect(getSwitch()).not.toHaveAccessibleDescription();
    await user.hover(screen.getByText(SWITCH_LABEL));
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.queryByTestId('switch-time-taken-automation-disabled-reason-help')).toBeNull();
  });

  test('should show the reason in a tooltip when focusing a cost input as non-superuser', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    const user = userEvent.setup();
    renderRow();
    const input = screen.getByTestId('monthly_subscription_cost');
    await user.click(input);
    expect(input).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(ADMIN_ONLY_REASON);
    expect(input).toHaveAccessibleDescription(ADMIN_ONLY_REASON);
  });

  test('should show the reason in a tooltip when hovering the switch as non-superuser', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    const user = userEvent.setup();
    renderRow();
    const toggle = getSwitch();
    await user.hover(screen.getByText(SWITCH_LABEL));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(ADMIN_ONLY_REASON);
    // The disabled switch cannot be focused, so the reason is also its description.
    expect(toggle).toHaveAccessibleDescription(ADMIN_ONLY_REASON);
  });

  test('should show the reason when the switch help button is focused as non-superuser', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    const user = userEvent.setup();
    renderRow();
    const help = screen.getByRole('button', { name: ADMIN_ONLY_REASON });
    // The disabled switch cannot be focused, so keyboard users reach the reason here.
    // Tab past the inputs and their help buttons; the button is the last focusable element.
    for (let i = 0; i < 10 && document.activeElement !== help; i++) {
      await user.tab();
    }
    expect(help).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(ADMIN_ONLY_REASON);
  });

  test('should show the reason when there is no active user', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: null });
    const user = userEvent.setup();
    renderRow();
    const input = screen.getByTestId('monthly_subscription_cost');
    expect(input).toHaveAttribute('readonly');
    await user.click(input);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(ADMIN_ONLY_REASON);
    expect(getSwitch()).toHaveAccessibleDescription(ADMIN_ONLY_REASON);
  });

  test('should show no reason tooltip for superuser', async () => {
    const user = userEvent.setup();
    renderRow();
    const input = screen.getByTestId('monthly_subscription_cost');
    expect(input).not.toHaveAttribute('readonly');
    await user.click(input);
    await user.hover(screen.getByText(SWITCH_LABEL));
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(getSwitch()).not.toHaveAccessibleDescription();
    expect(screen.queryByTestId('switch-time-taken-automation-disabled-reason-help')).toBeNull();
  });

  test('should not change a cost input when typing as non-superuser', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    const user = userEvent.setup();
    renderRow();
    const input = screen.getByTestId('engineer_avg_hourly_rate');
    await user.type(input, '9');
    expect(input).toHaveValue(50);
  });

  test('should not call put when not superuser', async () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    let putCalled = false;
    server.use(
      http.put(/subscription_costs/, () => {
        putCalled = true;
        return HttpResponse.json({});
      })
    );
    renderRow();
    const input = screen.getByTestId('engineer_avg_hourly_rate');

    // Dispatch a change event directly on the read-only input, bypassing the
    // browser-level read-only guard.  The debounce fires after 600 ms and calls
    // toolbarChangeHandler, which must return early because controlsDisabled is
    // true (is_superuser: false).  This proves the in-component guard — not
    // merely the readonly attribute — is what prevents the PUT.
    // fireEvent.change is intentional: read-only inputs reject userEvent typing.
    fireEvent.change(input, { target: { value: '75' } });

    // Wait beyond the debounce (600 ms) to let any scheduled PUT fire.
    await new Promise((r) => setTimeout(r, 700));
    expect(putCalled).toBe(false);
  });

  // --- toolbarChangeHandler: success ---

  test('should call setCostState and refresh without success toast on engineer_avg_hourly_rate change', async () => {
    renderRow();
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(mockSetCostState).toHaveBeenCalled();
    expect(screen.queryByText(/Subscription costs updated successfully/i)).not.toBeInTheDocument();
  });

  test('should call refresh without success toast on monthly_subscription_cost change', async () => {
    renderRow();
    await triggerInputChange('monthly_subscription_cost', '200');
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(screen.queryByText(/Subscription costs updated successfully/i)).not.toBeInTheDocument();
  });

  test('should call setCostState without success toast when switch is toggled', async () => {
    const user = userEvent.setup();
    renderRow();
    await user.click(screen.getByTestId('switch-time-taken-automation-toggle'));
    await waitFor(() => expect(mockSetCostState).toHaveBeenCalled());
    expect(screen.queryByText(/Subscription costs updated successfully/i)).not.toBeInTheDocument();
  });

  test('should skip setCostState call when setCostState is undefined', async () => {
    renderRow(buildProps({ setCostState: undefined }));
    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
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

  // --- toolbarChangeHandler: rapid consecutive edits (AAP-87021) ---

  test('should serialize rapid edits and send the latest values of all fields', async () => {
    const bodies: ISubscriptionCosts[] = [];
    let releaseFirstPut!: () => void;
    const firstPutGate = new Promise<void>((resolve) => {
      releaseFirstPut = resolve;
    });
    server.use(
      http.put(/subscription_costs/, async ({ request }) => {
        const body = (await request.json()) as ISubscriptionCosts;
        bodies.push(body);
        if (bodies.length === 1) {
          await firstPutGate;
        }
        return HttpResponse.json(body);
      })
    );
    renderRow();

    await triggerInputChange('engineer_avg_hourly_rate', '75');
    await waitFor(() => expect(bodies).toHaveLength(1));

    // Second edit while the first PUT is still in flight: it must wait, not overtake.
    await triggerInputChange('monthly_subscription_cost', '200');
    await new Promise((r) => setTimeout(r, 700));
    expect(bodies).toHaveLength(1);

    releaseFirstPut();
    await waitFor(() => expect(bodies).toHaveLength(2));
    const latest = {
      ...defaultCostState,
      engineer_avg_hourly_rate: 75,
      monthly_subscription_cost: 200,
    };
    expect(bodies[1]).toEqual(latest);

    // Only the latest response is applied — the older one never reverts the state.
    await waitFor(() => expect(mockSetCostState).toHaveBeenCalledTimes(1));
    expect(mockSetCostState).toHaveBeenCalledWith(latest);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test('should send the toggled-back value when the switch is clicked twice quickly', async () => {
    const bodies: ISubscriptionCosts[] = [];
    let releaseFirstPut!: () => void;
    const firstPutGate = new Promise<void>((resolve) => {
      releaseFirstPut = resolve;
    });
    server.use(
      http.put(/subscription_costs/, async ({ request }) => {
        const body = (await request.json()) as ISubscriptionCosts;
        bodies.push(body);
        if (bodies.length === 1) {
          await firstPutGate;
        }
        return HttpResponse.json(body);
      })
    );
    const user = userEvent.setup();
    renderRow();
    const toggle = screen.getByTestId('switch-time-taken-automation-toggle');

    await user.click(toggle);
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();

    releaseFirstPut();
    await waitFor(() => expect(bodies).toHaveLength(2));
    expect(bodies[1].include_template_creation_time_in_costs).toBe(false);
    await waitFor(() => expect(mockSetCostState).toHaveBeenCalledTimes(1));
    expect(mockSetCostState).toHaveBeenCalledWith(defaultCostState);
  });
});
