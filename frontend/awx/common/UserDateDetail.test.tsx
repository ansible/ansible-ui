import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserDateDetail } from './UserDateDetail';

const pageNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

describe('UserDateDetail', () => {
  it('renders date detail and navigates to user on click', async () => {
    const user = userEvent.setup();
    render(
      <UserDateDetail
        label="Modified"
        date="2025-01-01T12:00:00Z"
        user={{ id: 9, username: 'admin', first_name: 'A', last_name: 'B' }}
      />
    );

    expect(screen.getByText('Modified')).toBeInTheDocument();
    await user.click(screen.getByText('admin'));
    expect(pageNavigate).toHaveBeenCalledWith(expect.anything(), { params: { id: 9 } });
  });
});
