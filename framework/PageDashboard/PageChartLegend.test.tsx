/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageChartLegend } from './PageChartLegend';

const legend = [
  { label: 'Success', count: 3, color: 'green', link: '/success' },
  { label: 'Failed', count: 0, color: 'red' },
  { label: 'Pending', count: 1, color: 'blue' },
];

describe('PageChartLegend', () => {
  it('renders horizontal legend with counts and links', () => {
    render(
      <MemoryRouter>
        <PageChartLegend id="jobs" legend={legend} horizontal />
      </MemoryRouter>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Success' })).toHaveAttribute('href', '/success');
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders vertical legend and hides counts when requested', () => {
    render(
      <MemoryRouter>
        <PageChartLegend id="hosts" legend={legend} showLegendCount={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('includes zero-count items when allowZero is set', () => {
    render(
      <MemoryRouter>
        <PageChartLegend id="all" legend={legend} horizontal allowZero />
      </MemoryRouter>
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
