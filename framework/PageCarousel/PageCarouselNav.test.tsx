/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageCarouselNav } from './PageCarouselNav';

describe('PageCarouselNav', () => {
  it('should disable the prev button when on the first page', () => {
    render(<PageCarouselNav setPage={vi.fn()} currentPage={0} totalPages={3} />);
    expect(screen.getByRole('button', { name: 'Navigate to the previous page' })).toBeDisabled();
  });

  it('should disable the next button when on the last page', () => {
    render(<PageCarouselNav setPage={vi.fn()} currentPage={2} totalPages={3} />);
    expect(screen.getByRole('button', { name: 'Navigate to the next page' })).toBeDisabled();
  });

  it('should call setPage with currentPage + 1 when next is clicked', async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();
    render(<PageCarouselNav setPage={setPage} currentPage={1} totalPages={3} />);

    await user.click(screen.getByRole('button', { name: 'Navigate to the next page' }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it('should call setPage with currentPage - 1 when prev is clicked', async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();
    render(<PageCarouselNav setPage={setPage} currentPage={1} totalPages={3} />);

    await user.click(screen.getByRole('button', { name: 'Navigate to the previous page' }));
    expect(setPage).toHaveBeenCalledWith(0);
  });

  it('should call setPage with the dot index when a dot is clicked', async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();
    render(<PageCarouselNav setPage={setPage} currentPage={0} totalPages={3} />);

    const dots = screen.getAllByRole('button', { name: /Navigate to page/ });
    await user.click(dots[2]);
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it('should clamp currentPage via useEffect when it exceeds totalPages', () => {
    const setPage = vi.fn();
    render(<PageCarouselNav setPage={setPage} currentPage={5} totalPages={3} />);
    expect(setPage).toHaveBeenCalledWith(2);
  });
});
