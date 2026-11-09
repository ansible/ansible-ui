/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBreakpoint } from './components/useBreakPoint';
import { PageBody } from './PageBody';

vi.mock('./components/useBreakPoint', () => ({
  useBreakpoint: vi.fn(() => false),
}));

describe('PageBody', () => {
  beforeEach(() => {
    vi.mocked(useBreakpoint).mockReturnValue(false);
  });

  it('should render children', () => {
    render(<PageBody>Test Content</PageBody>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom style', () => {
    const { container } = render(<PageBody style={{ backgroundColor: 'red' }}>Content</PageBody>);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv).toBeInTheDocument();
  });

  it('should render with disablePadding', () => {
    const { container } = render(<PageBody disablePadding>Content</PageBody>);
    const innerDiv = container.querySelector('.border');
    expect(innerDiv).not.toBeInTheDocument();
  });

  it('should apply bordered padding on xxl breakpoints when padding is enabled', () => {
    vi.mocked(useBreakpoint).mockReturnValue(true);
    const { container } = render(<PageBody>Wide Content</PageBody>);
    expect(useBreakpoint).toHaveBeenCalledWith('xxl');
    expect(container.querySelector('.border')).toBeInTheDocument();
    expect(screen.getByText('Wide Content')).toBeInTheDocument();
  });
});
