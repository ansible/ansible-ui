import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatbotProvider, ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useChatbot } from './ChatbotState';

const mockGet = vi.fn();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetRequest: () => mockGet,
}));

describe('useChatbot', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ChatbotProvider>{children}</ChatbotProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when chatbot is disabled', async () => {
    mockGet.mockRejectedValue(new Error('Service unavailable'));

    const { result } = renderHook(() => useChatbot(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true when chatbot service is ok', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'ok' });

    const { result } = renderHook(() => useChatbot(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when chatbot service is not ok', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'error' });

    const { result } = renderHook(() => useChatbot(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should call the correct API endpoint', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'ok' });

    renderHook(() => useChatbot(), { wrapper });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/lightspeed/v1/health/status/chatbot/', {});
    });
  });

  it('should set state to Closed when service is ok', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'ok' });

    const { result } = renderHook(
      () => {
        const chatbotEnabled = useChatbot();
        const { chatbotState } = useAppChatbotContext();
        return { chatbotEnabled, chatbotState };
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Closed);
    });
  });

  it('should set state to Disabled when service returns error', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'error' });

    const { result } = renderHook(
      () => {
        const chatbotEnabled = useChatbot();
        const { chatbotState } = useAppChatbotContext();
        return { chatbotEnabled, chatbotState };
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Disabled);
    });
  });

  it('should set state to Disabled when API call fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(
      () => {
        const chatbotEnabled = useChatbot();
        const { chatbotState } = useAppChatbotContext();
        return { chatbotEnabled, chatbotState };
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Disabled);
    });
  });

  it('should only check status once', async () => {
    mockGet.mockResolvedValue({ 'chatbot-service': 'ok' });

    const { rerender } = renderHook(() => useChatbot(), { wrapper });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    rerender();

    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
