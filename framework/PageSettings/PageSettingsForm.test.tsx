import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageSettingsContext, IPageSettings } from './PageSettingsProvider';
import { PageSettingsForm } from './PageSettingsForm';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: () => navigate,
}));

describe('PageSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the language preference and saves settings', async () => {
    const user = userEvent.setup();
    const setSettings = vi.fn();
    const settings: IPageSettings = { language: 'browser' };

    render(
      <MemoryRouter>
        <PageSettingsContext.Provider value={[settings, setSettings]}>
          <PageSettingsForm />
        </PageSettingsContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('User preferences')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save user preferences' }));

    expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ language: 'browser' }));
    expect(navigate).toHaveBeenCalledWith('..');
  });

  it('navigates back when cancelled', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageSettingsContext.Provider value={[{}, vi.fn()]}>
          <PageSettingsForm />
        </PageSettingsContext.Provider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith('..');
  });
});
