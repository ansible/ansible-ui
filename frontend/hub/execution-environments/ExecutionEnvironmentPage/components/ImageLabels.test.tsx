/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ShaLabel, ShaLink, TagLabel, TagLink } from './ImageLabels';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => (_route: string, opts?: { params?: Record<string, string> }) =>
      `/ee/${opts?.params?.id ?? ''}/images/${opts?.params?.tag ?? ''}`,
  };
});

describe('ImageLabels', () => {
  const digest = 'sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

  it('ShaLabel truncates digest by default', () => {
    render(<ShaLabel digest={digest} />);
    expect(screen.getByText('sha256:abcdef12')).toBeInTheDocument();
  });

  it('ShaLabel shows full digest when long is set', () => {
    render(<ShaLabel digest={digest} long />);
    expect(screen.getByText(digest)).toBeInTheDocument();
  });

  it('TagLabel renders tag text and supports onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TagLabel tag="latest" onClose={onClose} />);
    expect(screen.getByText('latest')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('ShaLink links to image details route', () => {
    render(
      <MemoryRouter>
        <ShaLink id="test-ee" digest={digest} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/ee/test-ee/images/${digest}`);
  });

  it('TagLink links to image details route', () => {
    render(
      <MemoryRouter>
        <TagLink id="test-ee" tag="latest" />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/ee/test-ee/images/latest');
  });
});
