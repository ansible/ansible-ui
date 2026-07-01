import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JobOutputLoadingRow } from './JobOutputLoadingRow';

describe('JobOutputLoadingRow', () => {
  it('should render a skeleton element', () => {
    const queryJobOutputEvent = vi.fn();
    const { container } = render(
      <JobOutputLoadingRow counter={5} queryJobOutputEvent={queryJobOutputEvent} />
    );

    expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
  });

  it('should call queryJobOutputEvent with the counter on mount', () => {
    const queryJobOutputEvent = vi.fn();
    render(<JobOutputLoadingRow counter={3} queryJobOutputEvent={queryJobOutputEvent} />);

    expect(queryJobOutputEvent).toHaveBeenCalledWith(3);
    expect(queryJobOutputEvent).toHaveBeenCalledTimes(1);
  });

  it('should render the output grid row structure', () => {
    const queryJobOutputEvent = vi.fn();
    const { container } = render(
      <JobOutputLoadingRow counter={1} queryJobOutputEvent={queryJobOutputEvent} />
    );

    expect(container.querySelector('.output-grid-row')).toBeInTheDocument();
    expect(container.querySelector('.expand-column')).toBeInTheDocument();
    expect(container.querySelector('.stdout-column')).toBeInTheDocument();
  });

  it('should call queryJobOutputEvent again when counter changes', () => {
    const queryJobOutputEvent = vi.fn();
    const { rerender } = render(
      <JobOutputLoadingRow counter={1} queryJobOutputEvent={queryJobOutputEvent} />
    );

    expect(queryJobOutputEvent).toHaveBeenCalledWith(1);

    rerender(<JobOutputLoadingRow counter={2} queryJobOutputEvent={queryJobOutputEvent} />);

    expect(queryJobOutputEvent).toHaveBeenCalledWith(2);
  });
});
