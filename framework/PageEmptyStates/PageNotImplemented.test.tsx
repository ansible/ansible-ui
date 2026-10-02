/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageNotImplemented } from './PageNotImplemented';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PageNotImplemented', () => {
  it('should render "Under Development" heading', () => {
    render(
      <MemoryRouter>
        <PageNotImplemented />
      </MemoryRouter>
    );

    expect(screen.getByText('Under Development')).toBeInTheDocument();
  });

  it('should call navigate(-1) when "Return to previous page" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageNotImplemented />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Return to previous page' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should render link to dashboard', () => {
    render(
      <MemoryRouter>
        <PageNotImplemented />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Return to dashboard' });
    expect(link).toHaveAttribute('href', '/');
  });
});
