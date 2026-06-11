import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BytesCell } from './BytesCell';

describe('BytesCell', () => {
  it('should render 0 for zero bytes', () => {
    render(<BytesCell bytes={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render empty for NaN bytes', () => {
    const { container } = render(<BytesCell bytes={NaN} />);
    expect(container.textContent).toBe('');
  });

  it('should render bytes correctly', () => {
    render(<BytesCell bytes={500} />);
    expect(screen.getByText('500 Bytes')).toBeInTheDocument();
  });

  it('should render KB correctly', () => {
    render(<BytesCell bytes={1024} />);
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('should render MB correctly', () => {
    render(<BytesCell bytes={1024 * 1024} />);
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('should render GB correctly', () => {
    render(<BytesCell bytes={1024 * 1024 * 1024} />);
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });

  it('should render TB correctly', () => {
    render(<BytesCell bytes={1024 * 1024 * 1024 * 1024} />);
    expect(screen.getByText('1 TB')).toBeInTheDocument();
  });

  it('should respect decimals parameter', () => {
    render(<BytesCell bytes={1536} decimals={2} />);
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
  });

  it('should handle negative decimals as 0', () => {
    render(<BytesCell bytes={1536} decimals={-1} />);
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('should render large values correctly', () => {
    render(<BytesCell bytes={5 * 1024 * 1024 * 1024} decimals={1} />);
    expect(screen.getByText('5 GB')).toBeInTheDocument();
  });
});
