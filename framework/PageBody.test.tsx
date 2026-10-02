/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageBody } from './PageBody';

vi.mock('./components/useBreakPoint', () => ({
  useBreakpoint: () => false,
}));

describe('PageBody', () => {
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
});
