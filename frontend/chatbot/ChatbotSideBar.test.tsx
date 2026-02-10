/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppChatbotContext, ChatbotStateEnum } from './ChatbotProvider';
import { ChatbotSideBar } from './ChatbotSideBar';

vi.mock('./LazyChatbot', () => ({
  LazyChatbot: () => <div data-testid="lazy-chatbot">Chatbot Content</div>,
}));

vi.mock('./LazyChatbotSideBarHeader', () => ({
  LazyChatbotSideBarHeader: () => <div data-testid="lazy-chatbot-header">Chatbot Header</div>,
}));

describe('ChatbotSideBar', () => {
  const mockSetChatbotState = vi.fn();

  const renderWithContext = (chatbotState: ChatbotStateEnum) => {
    return render(
      <AppChatbotContext.Provider value={{ chatbotState, setChatbotState: mockSetChatbotState }}>
        <ChatbotSideBar>
          <div data-testid="children-content">Main Content</div>
        </ChatbotSideBar>
      </AppChatbotContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children content', () => {
    renderWithContext(ChatbotStateEnum.Closed);

    expect(screen.getByTestId('children-content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('should render drawer in collapsed state when chatbot is closed', () => {
    renderWithContext(ChatbotStateEnum.Closed);

    const drawer = document.querySelector('.pf-v6-c-drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).not.toHaveClass('pf-m-expanded');
  });

  it('should render drawer in expanded state when chatbot is open', () => {
    renderWithContext(ChatbotStateEnum.Open);

    const drawer = document.querySelector('.pf-v6-c-drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('pf-m-expanded');
  });

  it('should render lazy chatbot header', () => {
    renderWithContext(ChatbotStateEnum.Open);

    expect(screen.getByTestId('lazy-chatbot-header')).toBeInTheDocument();
  });

  it('should render lazy chatbot content', () => {
    renderWithContext(ChatbotStateEnum.Open);

    expect(screen.getByTestId('lazy-chatbot')).toBeInTheDocument();
  });

  it('should close chatbot when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(ChatbotStateEnum.Open);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockSetChatbotState).toHaveBeenCalledWith(ChatbotStateEnum.Closed);
  });

  it('should have inline drawer layout', () => {
    renderWithContext(ChatbotStateEnum.Closed);

    const drawer = document.querySelector('.pf-v6-c-drawer');
    expect(drawer).toHaveClass('pf-m-inline');
  });

  it('should have resizable panel content', () => {
    renderWithContext(ChatbotStateEnum.Open);

    const panelContent = document.querySelector('.pf-v6-c-drawer__panel');
    expect(panelContent).toHaveClass('pf-m-resizable');
  });
});
