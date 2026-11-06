import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { categoryColor } from '../../AnalyticsReportBuilder/constants';
import { Breakdown } from './Breakdown';

describe('Breakdown', () => {
  it('renders category bars and percent labels', () => {
    render(
      <Breakdown categoryCount={{ ok: 3, failed: 1 }} categoryColor={categoryColor} showPercent />
    );
    expect(screen.getByText(/Ok 75%/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed 25%/i)).toBeInTheDocument();
  });
});
