import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivationInstanceOutputRow } from './ActivationInstanceOutputRow';

let resizeObserverCallback: (() => void) | undefined;

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn((_ref: unknown, callback: () => void) => {
    resizeObserverCallback = callback;
  }),
}));

describe('ActivationInstanceOutputRow', () => {
  afterEach(() => {
    resizeObserverCallback = undefined;
  });

  it('should use the local row index for height tracking and the offset line number for display', () => {
    const setHeight = vi.fn();

    render(
      <ActivationInstanceOutputRow
        index={2}
        lineNumber={5001}
        row={{
          id: 3,
          log: 'log output',
          log_timestamp: 100,
          activation_instance: 1,
        }}
        setHeight={setHeight}
      />
    );

    expect(screen.getByText('5001')).toBeInTheDocument();
    expect(resizeObserverCallback).toBeDefined();

    resizeObserverCallback?.();

    expect(setHeight).toHaveBeenCalledWith(2, 0);
  });
});
