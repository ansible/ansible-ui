/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LazyChatbotSideBarHeader } from './LazyChatbotSideBarHeader';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('./ChatbotSideBarHeader', () => ({
  default: () => <div data-testid="chatbot-sidebar-header">Sidebar Header Content</div>,
}));

describe('LazyChatbotSideBarHeader', () => {
  it('should render loading fallback initially', () => {
    render(<LazyChatbotSideBarHeader />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render ChatbotSideBarHeader after lazy load', async () => {
    render(<LazyChatbotSideBarHeader />);

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-sidebar-header')).toBeInTheDocument();
    });
  });

  it('should render header content after loading', async () => {
    render(<LazyChatbotSideBarHeader />);

    await waitFor(() => {
      expect(screen.getByText('Sidebar Header Content')).toBeInTheDocument();
    });
  });
});
