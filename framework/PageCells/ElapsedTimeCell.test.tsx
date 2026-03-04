import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ElapsedTimeCell } from './ElapsedTimeCell';

describe('ElapsedTimeCell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render empty when no start time provided', () => {
    const { container } = render(<ElapsedTimeCell />);
    expect(container.textContent).toBe('');
  });

  it('should render seconds correctly', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-01T00:00:30Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    expect(container.textContent).toContain('30');
    expect(container.textContent).toContain('s');
  });

  it('should render minutes and seconds correctly', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-01T00:05:30Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    expect(container.textContent).toContain('5');
    expect(container.textContent).toContain('m');
    expect(container.textContent).toContain('30');
  });

  it('should render hours correctly', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-01T02:30:45Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('h');
    expect(container.textContent).toContain('30');
    expect(container.textContent).toContain('45');
  });

  it('should render days correctly', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-03T05:30:45Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('d');
  });

  it('should handle string date formats', () => {
    const { container } = render(
      <ElapsedTimeCell start="2024-01-01T00:00:00Z" finish="2024-01-01T00:01:00Z" />
    );
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('m');
  });

  it('should handle zero elapsed time', () => {
    const time = new Date('2024-01-01T00:00:00Z').getTime();

    const { container } = render(<ElapsedTimeCell start={time} finish={time} />);
    expect(container.textContent).toContain('0');
    expect(container.textContent).toContain('s');
  });

  it('should not show zero days', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-01T00:01:00Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    // Should not contain 'd' for days when days is 0
    expect(container.textContent).not.toContain('d');
  });

  it('should not show zero hours', () => {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const finish = new Date('2024-01-01T00:01:00Z').getTime();

    const { container } = render(<ElapsedTimeCell start={start} finish={finish} />);
    // Should not contain 'h' for hours when hours is 0
    expect(container.textContent).not.toContain('h');
  });
});
