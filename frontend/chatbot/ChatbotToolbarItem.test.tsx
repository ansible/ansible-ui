import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppChatbotContext, ChatbotStateEnum } from './ChatbotProvider';
import { ChatbotToolbarItem } from './ChatbotToolbarItem';

vi.mock('./ChatbotState', () => ({
  useChatbot: vi.fn(() => true),
}));

import { useChatbot } from './ChatbotState';

describe('ChatbotToolbarItem', () => {
  const mockSetChatbotState = vi.fn();

  const renderWithContext = (chatbotState: ChatbotStateEnum, chatbotEnabled = true) => {
    vi.mocked(useChatbot).mockReturnValue(chatbotEnabled);

    return render(
      <AppChatbotContext.Provider value={{ chatbotState, setChatbotState: mockSetChatbotState }}>
        <ChatbotToolbarItem />
      </AppChatbotContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chatbot button when chatbot is enabled', () => {
    renderWithContext(ChatbotStateEnum.Closed, true);

    expect(screen.getByTestId('chatbot-badge')).toBeInTheDocument();
  });

  it('should not render chatbot button when chatbot is disabled', () => {
    renderWithContext(ChatbotStateEnum.Disabled, false);

    expect(screen.queryByTestId('chatbot-badge')).not.toBeInTheDocument();
  });

  it('should open chatbot when clicked while closed', async () => {
    const user = userEvent.setup();
    renderWithContext(ChatbotStateEnum.Closed, true);

    await user.click(screen.getByTestId('chatbot-badge'));

    expect(mockSetChatbotState).toHaveBeenCalledWith(ChatbotStateEnum.Open);
  });

  it('should close chatbot when clicked while open', async () => {
    const user = userEvent.setup();
    renderWithContext(ChatbotStateEnum.Open, true);

    await user.click(screen.getByTestId('chatbot-badge'));

    expect(mockSetChatbotState).toHaveBeenCalledWith(ChatbotStateEnum.Closed);
  });

  it('should have plain button variant', () => {
    renderWithContext(ChatbotStateEnum.Closed, true);

    const button = screen.getByTestId('chatbot-badge');
    expect(button).toHaveClass('pf-m-plain');
  });
});
