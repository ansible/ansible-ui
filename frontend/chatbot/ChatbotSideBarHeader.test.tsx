import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageSettings: vi.fn(() => ({ activeTheme: 'light' })),
}));

vi.mock('@ansible/ansible-ai-connect-chatbot', () => ({
  getProductName: () => 'Automation Intelligent Assistant',
  LIGHTSPEED_LOGO: 'light-logo.svg',
  LIGHTSPEED_LOGO_DARK: 'dark-logo.svg',
}));

import { usePageSettings } from '@ansible/ansible-ui-framework';
import ChatbotSideBarHeader from './ChatbotSideBarHeader';

describe('ChatbotSideBarHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the product name', () => {
    render(<ChatbotSideBarHeader />);

    expect(screen.getByText('Automation Intelligent Assistant')).toBeInTheDocument();
  });

  it('should render the logo image', () => {
    render(<ChatbotSideBarHeader />);

    const logo = screen.getByAltText('Lightspeed Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should use light logo when theme is light', () => {
    vi.mocked(usePageSettings).mockReturnValue({
      activeTheme: 'light',
    } as ReturnType<typeof usePageSettings>);

    render(<ChatbotSideBarHeader />);

    const logo = screen.getByAltText('Lightspeed Logo');
    expect(logo).toHaveAttribute('src', 'light-logo.svg');
  });

  it('should use dark logo when theme is dark', () => {
    vi.mocked(usePageSettings).mockReturnValue({
      activeTheme: 'dark',
    } as ReturnType<typeof usePageSettings>);

    render(<ChatbotSideBarHeader />);

    const logo = screen.getByAltText('Lightspeed Logo');
    expect(logo).toHaveAttribute('src', 'dark-logo.svg');
  });

  it('should use light logo when theme is undefined', () => {
    vi.mocked(usePageSettings).mockReturnValue({
      activeTheme: undefined,
    } as ReturnType<typeof usePageSettings>);

    render(<ChatbotSideBarHeader />);

    const logo = screen.getByAltText('Lightspeed Logo');
    expect(logo).toHaveAttribute('src', 'light-logo.svg');
  });
});
