import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailInfo } from './DetailInfo';

describe('DetailInfo', () => {
  it('renders title and optional description', () => {
    render(<DetailInfo title="Info title" description="More details" />);
    expect(screen.getByText('Info title')).toBeInTheDocument();
    expect(screen.getByText('More details')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<DetailInfo title="Title only" />);
    expect(screen.getByText('Title only')).toBeInTheDocument();
  });
});
