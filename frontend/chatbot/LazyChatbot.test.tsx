/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LazyChatbot } from './LazyChatbot';

vi.mock('./ChatbotPortal', () => ({
  default: () => <div data-testid="chatbot-portal">Chatbot Portal Content</div>,
}));

describe('LazyChatbot', () => {
  it('should render loading fallback initially', () => {
    render(<LazyChatbot />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render ChatbotPortal after lazy load', async () => {
    render(<LazyChatbot />);

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-portal')).toBeInTheDocument();
    });
  });

  it('should render portal content after loading', async () => {
    render(<LazyChatbot />);

    await waitFor(() => {
      expect(screen.getByText('Chatbot Portal Content')).toBeInTheDocument();
    });
  });
});
