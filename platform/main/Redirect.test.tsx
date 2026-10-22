import { render } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Redirect } from './Redirect';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseURLSearchParams = vi.fn(() => [new URLSearchParams()]);

vi.mock('@ansible/ansible-ui-framework/components/useURLSearchParams', () => ({
  useURLSearchParams: () => mockUseURLSearchParams(),
}));

describe('Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseURLSearchParams.mockReturnValue([new URLSearchParams()]);
  });

  test('should navigate home when next query param is absent', () => {
    render(<Redirect />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('should assign location when next query param is present', () => {
    const hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      configurable: true,
    });
    mockUseURLSearchParams.mockReturnValue([new URLSearchParams('next=/execution/projects')]);

    render(<Redirect />);

    expect(hrefSetter).toHaveBeenCalledWith('/execution/projects');
  });
});
