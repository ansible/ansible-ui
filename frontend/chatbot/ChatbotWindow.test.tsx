import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatbotWindow } from './ChatbotWindow';

vi.mock('@ansible/ansible-ai-connect-chatbot', () => ({
  App: ({ username }: { username?: string }) => (
    <div data-testid="chatbot-app">{username ?? 'anonymous'}</div>
  ),
}));

const mockUsePageSettings = vi.fn((): { activeTheme?: 'light' | 'dark' | 'system' } => ({
  activeTheme: 'light',
}));
vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageSettings: () => mockUsePageSettings(),
}));

describe('ChatbotWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, '0', { value: window, configurable: true });
    mockUsePageSettings.mockReturnValue({ activeTheme: 'light' });
    document.documentElement.className = '';
  });

  it('should render the chatbot app with a light theme class', () => {
    render(<ChatbotWindow />);
    expect(screen.getByTestId('chatbot-app')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(true);
  });

  it('should apply a dark theme class when activeTheme is dark', () => {
    mockUsePageSettings.mockReturnValue({ activeTheme: 'dark' });
    render(<ChatbotWindow />);
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  it('should clear theme classes for the system theme and ignore a missing theme', () => {
    mockUsePageSettings.mockReturnValue({ activeTheme: 'system' });
    const { rerender } = render(<ChatbotWindow />);
    expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(false);
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);

    document.documentElement.className = 'keep-me';
    mockUsePageSettings.mockReturnValue({});
    rerender(<ChatbotWindow />);
    expect(document.documentElement.classList.contains('keep-me')).toBe(true);
  });

  it('should update the username from a same-origin message and ignore invalid messages', async () => {
    render(<ChatbotWindow />);

    const post = (
      data: string,
      origin = window.location.origin,
      source: MessageEventSource | null = window
    ) => {
      const event = new MessageEvent('message', { data, origin });
      Object.defineProperty(event, 'source', { value: source });
      window.dispatchEvent(event);
    };

    post(JSON.stringify({ context: { username: 'ada' } }));
    await waitFor(() => expect(screen.getByTestId('chatbot-app')).toHaveTextContent('ada'));

    post('not-json');
    await waitFor(() => expect(screen.getByTestId('chatbot-app')).toHaveTextContent('anonymous'));

    post(JSON.stringify({ context: { username: 'ada' } }));
    await waitFor(() => expect(screen.getByTestId('chatbot-app')).toHaveTextContent('ada'));

    post(JSON.stringify({ context: { username: 'mallory' } }), 'https://evil.example');
    post(JSON.stringify({ context: { username: 'mallory' } }), window.location.origin, null);
    post('');
    expect(screen.getByTestId('chatbot-app')).toHaveTextContent('ada');
  });

  it('should remove the message listener when unmounted', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ChatbotWindow />);
    unmount();
    expect(removeListener).toHaveBeenCalledWith('message', expect.any(Function));
    removeListener.mockRestore();
  });
});
