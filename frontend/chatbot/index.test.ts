import { describe, expect, test } from 'vitest';
import * as chatbot from './index';

describe('chatbot package exports', () => {
  test('should re-export primary chatbot modules', () => {
    expect(chatbot.ChatbotButton).toBeDefined();
    expect(chatbot.ChatbotProvider).toBeDefined();
    expect(chatbot.ChatbotSideBar).toBeDefined();
    expect(chatbot.ChatbotWindow).toBeDefined();
    expect(chatbot.LazyChatbot).toBeDefined();
    expect(chatbot.useChatbot).toBeDefined();
  });
});
