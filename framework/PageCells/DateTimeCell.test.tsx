import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DateCell, DateTimeCell } from './DateTimeCell';

vi.mock('../PageSettings/PageSettingsProvider', () => ({
  usePageSettings: vi.fn(() => ({ dateFormat: 'date-time' })),
}));

vi.mock('../useFrameworkTranslations', () => ({
  useFrameworkTranslations: () => [{ by: 'by' }],
}));

import { usePageSettings } from '../PageSettings/PageSettingsProvider';

describe('DateCell', () => {
  it('should render date and time from number', () => {
    const date = new Date('2024-06-15T14:30:00Z');
    render(<DateCell value={date.getTime()} />);

    expect(screen.getByText(date.toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(date.toLocaleTimeString())).toBeInTheDocument();
  });

  it('should render date and time from string', () => {
    const dateString = '2024-06-15T14:30:00Z';
    const date = new Date(dateString);
    render(<DateCell value={dateString} />);

    expect(screen.getByText(date.toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(date.toLocaleTimeString())).toBeInTheDocument();
  });
});

describe('DateTimeCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageSettings).mockReturnValue({ dateFormat: 'date-time' } as ReturnType<
      typeof usePageSettings
    >);
  });

  it('should render empty for undefined value', () => {
    const { container } = render(<DateTimeCell value={undefined} />);
    expect(container.textContent).toBe('');
  });

  it('should render empty for null value', () => {
    const { container } = render(<DateTimeCell value={null} />);
    expect(container.textContent).toBe('');
  });

  it('should render date-time from ISO string', async () => {
    render(<DateTimeCell value="2024-06-15T14:30:00Z" />);

    await waitFor(() => {
      expect(screen.getByText(/2024|Jun|6/)).toBeInTheDocument();
    });
  });

  it('should render date-time from milliseconds', async () => {
    const timestamp = new Date('2024-06-15T14:30:00Z').getTime();
    render(<DateTimeCell value={timestamp} />);

    await waitFor(() => {
      expect(screen.getByText(/2024|Jun|6/)).toBeInTheDocument();
    });
  });

  it('should render author when provided', async () => {
    render(<DateTimeCell value="2024-06-15T14:30:00Z" author="John Doe" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('by')).toBeInTheDocument();
    });
  });

  it('should render author as button when onClick provided', async () => {
    const onClick = vi.fn();
    render(<DateTimeCell value="2024-06-15T14:30:00Z" author="Jane" onClick={onClick} />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: 'Jane' });
      expect(button).toBeInTheDocument();
    });
  });

  it('should call onClick when author button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DateTimeCell value="2024-06-15T14:30:00Z" author="Jane" onClick={onClick} />);

    await waitFor(async () => {
      const button = screen.getByRole('button', { name: 'Jane' });
      await user.click(button);
    });

    expect(onClick).toHaveBeenCalled();
  });

  it('should render relative time when format is since', async () => {
    vi.mocked(usePageSettings).mockReturnValue({ dateFormat: 'since' } as ReturnType<
      typeof usePageSettings
    >);

    const recentDate = new Date(Date.now() - 30000).toISOString(); // 30 seconds ago
    render(<DateTimeCell value={recentDate} />);

    await waitFor(() => {
      expect(screen.getByText('Less than a minute ago')).toBeInTheDocument();
    });
  });

  it('should have date-time class on container', async () => {
    const { container } = render(<DateTimeCell value="2024-06-15T14:30:00Z" />);

    await waitFor(() => {
      expect(container.querySelector('.date-time')).toBeInTheDocument();
    });
  });
});
