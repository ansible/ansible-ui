import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageSettingsDetails } from './PageSettingsDetails';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('./PageSettingsProvider', () => ({
  PageSettingsContext: {
    Consumer: ({ children }: { children: (value: unknown[]) => React.ReactNode }) =>
      children([{ refreshInterval: 30, theme: 'system' }, vi.fn()]),
  },
}));

vi.mock('./usePageSettingOptions', () => ({
  usePageSettingsOptions: () => [
    {
      name: 'refreshInterval',
      label: 'Refresh Interval',
      helpText: 'How often to refresh data',
      options: [
        { value: 30, label: '30 seconds' },
        { value: 60, label: '60 seconds' },
      ],
    },
  ],
}));

describe('PageSettingsDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display User Preferences title and description', () => {
    render(
      <MemoryRouter>
        <PageSettingsDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('User Preferences')).toBeInTheDocument();
    expect(screen.getByText('Customize your platform user experience.')).toBeInTheDocument();
  });

  it('should display Edit button', () => {
    render(
      <MemoryRouter>
        <PageSettingsDetails />
      </MemoryRouter>
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeInTheDocument();
  });

  it('should navigate to edit page when Edit button is clicked', () => {
    render(
      <MemoryRouter>
        <PageSettingsDetails />
      </MemoryRouter>
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    editButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('./edit');
  });
});
