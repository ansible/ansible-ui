import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('should render container with empty jobs array', () => {
    const { container } = render(
      <MemoryRouter>
        <Sparkline jobs={[]} />
      </MemoryRouter>
    );

    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render status cells when jobs are provided', () => {
    const jobs = [
      {
        id: 1,
        type: 'job',
        status: 'successful',
        finished: '2024-01-01T12:00:00Z',
      } as { id: number; type: string; status: string; finished: string | null },
    ];

    render(
      <MemoryRouter>
        <Sparkline jobs={jobs} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/view job 1/i)).toBeInTheDocument();
  });
});
