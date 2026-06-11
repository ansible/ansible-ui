import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageSettingsDetails } from './PageSettingsDetails';
import { IPageSettings, PageSettingsContext } from './PageSettingsProvider';

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

const mockSettings: IPageSettings = { refreshInterval: 30, theme: 'system' };
const mockSetSettings = vi.fn();

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
      <PageSettingsContext.Provider value={[mockSettings, mockSetSettings]}>
        <MemoryRouter>
          <PageSettingsDetails />
        </MemoryRouter>
      </PageSettingsContext.Provider>
    );

    expect(screen.getByText('User Preferences')).toBeInTheDocument();
    expect(screen.getByText('Customize your platform user experience.')).toBeInTheDocument();
  });

  it('should display Edit button', () => {
    render(
      <PageSettingsContext.Provider value={[mockSettings, mockSetSettings]}>
        <MemoryRouter>
          <PageSettingsDetails />
        </MemoryRouter>
      </PageSettingsContext.Provider>
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeInTheDocument();
  });

  it('should navigate to edit page when Edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <PageSettingsContext.Provider value={[mockSettings, mockSetSettings]}>
        <MemoryRouter>
          <PageSettingsDetails />
        </MemoryRouter>
      </PageSettingsContext.Provider>
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('./edit');
  });
});
