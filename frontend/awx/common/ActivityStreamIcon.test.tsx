import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityStreamIcon } from './ActivityStreamIcon';

const mockGetPageUrl = vi.fn(() => '/activity-stream');
const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ActivityStreamIcon', () => {
  beforeEach(() => {
    mockGetPageUrl.mockClear();
    mockNavigate.mockClear();
  });

  it('should render a button', () => {
    render(
      <MemoryRouter>
        <ActivityStreamIcon type="organization" />
      </MemoryRouter>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render activity stream icon for job templates', () => {
    render(
      <MemoryRouter>
        <ActivityStreamIcon type="job_template" />
      </MemoryRouter>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('navigates to activity stream for the resource type', async () => {
    const user = userEvent.setup();
    mockGetPageUrl.mockReturnValue('/activity-stream?type=organization');

    render(
      <MemoryRouter>
        <ActivityStreamIcon type="organization" />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button'));

    expect(mockGetPageUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query: { type: 'organization' },
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/activity-stream?type=organization');
  });
});
