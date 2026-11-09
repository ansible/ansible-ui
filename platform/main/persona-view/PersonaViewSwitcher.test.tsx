import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { usePersonaView } from './usePersonaView';
import { PersonaViewSwitcher } from './PersonaViewSwitcher';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PersonaViewSwitcher', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    usePersonaView.setState({ activePersonaViewId: 'administration' });
  });

  test('should switch persona views from the dropdown', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PersonaViewSwitcher />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Administration View' }));
    await user.click(screen.getByText('Operator View'));

    expect(usePersonaView.getState().activePersonaViewId).toBe('operator');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
