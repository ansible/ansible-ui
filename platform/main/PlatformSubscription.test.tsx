import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSubscription } from './PlatformSubscription';

const mockRefreshAwxConfig = vi.hoisted(() => vi.fn());
const mockUseAwxConfigState = vi.hoisted(() => vi.fn());
const mockUseHasAwxService = vi.hoisted(() => vi.fn());

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfigState: mockUseAwxConfigState,
}));

vi.mock('./GatewayServices', () => ({
  useHasAwxService: mockUseHasAwxService,
}));

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: Readonly<{ handleRefresh: () => void }>) => (
    <button type="button" onClick={props.handleRefresh}>
      Refresh
    </button>
  ),
}));

vi.mock('@ansible/ansible-ui-framework/components/LoadingState', () => ({
  LoadingState: () => <div>Loading</div>,
}));

vi.mock('../settings/SubscriptionWizard', () => ({
  SubscriptionWizard: (props: Readonly<{ onSuccess: () => void }>) => (
    <button type="button" onClick={props.onSuccess}>
      Complete subscription
    </button>
  ),
}));

describe('PlatformSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshAwxConfig.mockResolvedValue(undefined);
    mockUseHasAwxService.mockReturnValue(true);
    mockUseAwxConfigState.mockReturnValue({
      awxConfig: { license_info: { compliant: true } },
      awxConfigError: undefined,
      serviceDown: false,
      refreshAwxConfig: mockRefreshAwxConfig,
    });
  });

  it('refreshes the config when the AWX error retry action is used', async () => {
    const user = userEvent.setup();
    const error = new Error('Config request failed');
    mockUseAwxConfigState.mockReturnValue({
      awxConfig: undefined,
      awxConfigError: error,
      serviceDown: false,
      refreshAwxConfig: mockRefreshAwxConfig,
    });

    render(<PlatformSubscription>Content</PlatformSubscription>);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(mockRefreshAwxConfig).toHaveBeenCalledOnce();
  });

  it('does not refresh the config after the subscription wizard succeeds', async () => {
    const user = userEvent.setup();
    mockUseAwxConfigState.mockReturnValue({
      awxConfig: { license_info: {} },
      awxConfigError: undefined,
      serviceDown: false,
      refreshAwxConfig: mockRefreshAwxConfig,
    });

    render(<PlatformSubscription>Content</PlatformSubscription>);

    await user.click(screen.getByRole('button', { name: 'Complete subscription' }));

    expect(mockRefreshAwxConfig).not.toHaveBeenCalled();
  });

  it('refreshes the config when the subscription cannot be found', async () => {
    const user = userEvent.setup();
    mockUseAwxConfigState.mockReturnValue({
      awxConfig: null,
      awxConfigError: undefined,
      serviceDown: false,
      refreshAwxConfig: mockRefreshAwxConfig,
    });

    render(<PlatformSubscription>Content</PlatformSubscription>);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(mockRefreshAwxConfig).toHaveBeenCalledOnce();
  });

  it('renders children when the subscription is already configured', () => {
    render(<PlatformSubscription>Content</PlatformSubscription>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
