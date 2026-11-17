import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders a centered spinner', () => {
    render(<LoadingState />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
