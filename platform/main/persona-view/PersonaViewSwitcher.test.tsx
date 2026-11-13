import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PersonaViewSwitcher } from './PersonaViewSwitcher';

const mockSetActivePersonaView = vi.fn();
const mockNavigate = vi.fn();

vi.mock('./usePersonaView', () => ({
  usePersonaView: () => ({
    activePersonaViewId: 'administration',
    setActivePersonaView: mockSetActivePersonaView,
  }),
}));

vi.mock('./usePersonaViews', () => ({
  usePersonaViews: () => [
    { id: 'administration', name: 'Administration View', description: 'admin desc' },
    { id: 'operator', name: 'Operator View', description: 'operator desc' },
  ],
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PersonaViewSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the active persona name on the toggle', () => {
    render(
      <MemoryRouter>
        <PersonaViewSwitcher />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Administration View' })).toBeInTheDocument();
  });

  it('switches persona and navigates home when an item is selected', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <PersonaViewSwitcher />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Administration View' }));
    const menuItems = await screen.findAllByRole('menuitem');
    await user.click(menuItems[1]);

    expect(mockSetActivePersonaView).toHaveBeenCalledWith('operator');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
