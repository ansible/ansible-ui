/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PagePagination } from './PagePagination';

describe('PagePagination', () => {
  it('should render pagination with item count', () => {
    render(
      <PagePagination
        itemCount={100}
        page={1}
        perPage={10}
        setPage={vi.fn()}
        setPerPage={vi.fn()}
      />
    );
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should call setPage when navigating to next page', async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();
    render(
      <PagePagination
        itemCount={100}
        page={1}
        perPage={10}
        setPage={setPage}
        setPerPage={vi.fn()}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it('should call setPerPage when changing per page', async () => {
    const user = userEvent.setup();
    const setPerPage = vi.fn();
    render(
      <PagePagination
        itemCount={100}
        page={1}
        perPage={10}
        setPage={vi.fn()}
        setPerPage={setPerPage}
        perPageOptions={[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 },
        ]}
      />
    );

    const perPageMenu = screen.getByRole('button', { name: /1 - 10 of 100/i });
    await user.click(perPageMenu);

    const option20 = screen.getByRole('menuitem', { name: /20 per page/i });
    await user.click(option20);
    expect(setPerPage).toHaveBeenCalledWith(20);
  });
});
