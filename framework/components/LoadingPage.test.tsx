import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingPage } from './LoadingPage';

describe('LoadingPage', () => {
  it('should render loading state without tabs', () => {
    render(<LoadingPage />);
    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });

  it('should render tab skeleton when tabs is true', () => {
    const { container } = render(<LoadingPage tabs />);
    expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});
