import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageNotFound } from './PageNotFound';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PageNotFound', () => {
  it('renders not-found messaging and dashboard link', () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toHaveAttribute('href', '/');
  });

  it('navigates back when the return button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'Return to previous page' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
