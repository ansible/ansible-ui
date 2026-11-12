import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatbotWindow } from './ChatbotWindow';

vi.mock('@ansible/ansible-ai-connect-chatbot', () => ({
  App: ({ username }: { username?: string }) => (
    <div data-testid="chatbot-app">{username ?? 'anonymous'}</div>
  ),
}));

const mockUsePageSettings = vi.fn((): { activeTheme: 'light' | 'dark' } => ({
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
});
