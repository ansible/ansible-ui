import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlatformMain, { PlatformMainInternal } from './PlatformMain';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: (props: Record<string, unknown>) => (
    <div data-testid="page-framework">{props.children as React.ReactNode}</div>
  ),
}));
vi.mock('@ansible/common-ui/i18n', () => ({}));
vi.mock('./PlatformApp', () => ({
  PlatformApp: () => <div data-testid="platform-app" />,
}));

vi.mock('./PlatformLogin', () => ({
  PlatformLogin: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./PlatformActiveUserProvider', () => ({
  PlatformActiveUserProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./GatewayUIAuth', () => ({
  GatewayUIAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseGet = vi.fn<(...args: unknown[]) => { data: { version: string } }>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (...args: unknown[]): ReturnType<typeof mockUseGet> => mockUseGet(...args),
}));

const mockUseHasAwxService = vi.fn<(forceV25?: boolean) => boolean>();
const mockUseHasEdaService = vi.fn<() => boolean>();
const mockUseHasHubService = vi.fn<() => boolean>();
vi.mock('./GatewayServices', async () => {
  const actual = await vi.importActual<typeof import('./GatewayServices')>('./GatewayServices');
  return {
    ...actual,
    GatewayServicesProvider: ({ children }: { children: React.ReactNode }) => children,
    useHasAwxService: (...args: unknown[]): boolean => mockUseHasAwxService(...args),
    useHasEdaService: (): boolean => mockUseHasEdaService(),
    useHasHubService: (): boolean => mockUseHasHubService(),
  };
});

vi.mock('@ansible/awx-ui/common/useAwxWebSocket', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  AwxConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@ansible/eda-ui/common/useEdaActiveUser', () => ({
  EdaActiveUserProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@ansible/hub-ui/common/useHubContext', () => ({
  HubContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@ansible/chatbot/ChatbotProvider', () => ({
  ChatbotProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('../overview/quickstarts/QuickStartProvider', () => ({
  QuickStartProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('./PlatformSubscription', () => ({
  PlatformSubscription: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PlatformMain', () => {
  beforeEach(() => {
    mockUseGet.mockReturnValue({ data: { version: '2.6.0' } });
    mockUseHasAwxService.mockReturnValue(true);
    mockUseHasEdaService.mockReturnValue(true);
    mockUseHasHubService.mockReturnValue(true);
  });

  it('should render PageFramework with PlatformApp', () => {
    const { getByTestId } = render(<PlatformMain />);
    expect(getByTestId('page-framework')).toBeInTheDocument();
  });
});

describe('PlatformMainInternal', () => {
  it('should render the platform app when gateway ping succeeds', () => {
    mockUseGet.mockReturnValue({ data: { version: '2.6.0' } });
    mockUseHasAwxService.mockReturnValue(true);
    mockUseHasEdaService.mockReturnValue(true);
    mockUseHasHubService.mockReturnValue(true);

    render(<PlatformMainInternal />);

    expect(screen.getByTestId('platform-app')).toBeInTheDocument();
  });

  it('should fall back to version 2.5 when ping reports development', () => {
    mockUseGet.mockReturnValue({ data: { version: 'development' } });
    mockUseHasAwxService.mockReturnValue(false);
    mockUseHasEdaService.mockReturnValue(false);
    mockUseHasHubService.mockReturnValue(false);

    render(<PlatformMainInternal />);

    expect(mockUseHasAwxService).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('platform-app')).toBeInTheDocument();
  });
});
