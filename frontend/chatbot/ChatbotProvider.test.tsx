import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ChatbotProvider, ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';

describe('ChatbotProvider', () => {
  describe('ChatbotStateEnum', () => {
    it('should have correct enum values', () => {
      expect(ChatbotStateEnum.Open).toBe('open');
      expect(ChatbotStateEnum.Closed).toBe('closed');
      expect(ChatbotStateEnum.Disabled).toBe('disabled');
    });
  });

  describe('AppChatbotContext', () => {
    it('should have default values', () => {
      const { result } = renderHook(() => useAppChatbotContext());

      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Disabled);
      expect(typeof result.current.setChatbotState).toBe('function');
    });
  });

  describe('ChatbotProvider component', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    it('should provide initial state as Disabled', () => {
      const { result } = renderHook(() => useAppChatbotContext(), { wrapper });

      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Disabled);
    });

    it('should allow updating chatbot state to Open', () => {
      const { result } = renderHook(() => useAppChatbotContext(), { wrapper });

      act(() => {
        result.current.setChatbotState(ChatbotStateEnum.Open);
      });

      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Open);
    });

    it('should allow updating chatbot state to Closed', () => {
      const { result } = renderHook(() => useAppChatbotContext(), { wrapper });

      act(() => {
        result.current.setChatbotState(ChatbotStateEnum.Closed);
      });

      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Closed);
    });

    it('should allow toggling between states', () => {
      const { result } = renderHook(() => useAppChatbotContext(), { wrapper });

      act(() => {
        result.current.setChatbotState(ChatbotStateEnum.Open);
      });
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Open);

      act(() => {
        result.current.setChatbotState(ChatbotStateEnum.Closed);
      });
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Closed);

      act(() => {
        result.current.setChatbotState(ChatbotStateEnum.Disabled);
      });
      expect(result.current.chatbotState).toBe(ChatbotStateEnum.Disabled);
    });
  });
});
