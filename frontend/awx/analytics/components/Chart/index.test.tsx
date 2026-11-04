/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { customFunctions, Chart } from './index';

vi.mock('@ansible/react-json-chart-builder', () => ({
  default: ({ schema }: { schema: unknown[] }) => (
    <div data-testid="chart-builder">{JSON.stringify(schema)}</div>
  ),
  functions: {
    axisFormat: {},
    labelFormat: {},
    onClick: {},
  },
}));

vi.mock('./convertApi', () => ({
  convertApiToData: vi.fn(() => ({
    series: [{ serie: [{ id: '1' }], hidden: false, name: 'serie-1' }],
    legend: [],
  })),
}));

describe('Chart helpers', () => {
  it('adds custom axis formatters', () => {
    const fns = customFunctions();
    expect(fns.axisFormat.formatAsYear(Date.UTC(2020, 5, 15))).toMatch(/2020/);
    expect(fns.axisFormat.formatAsMonth(Date.UTC(2020, 5, 15))).toMatch(/June|Jun/);
    expect(fns.dataComponent.scatterPlot).toBeTypeOf('function');
  });

  it('renders ChartBuilder with converted data', () => {
    render(
      <Chart
        schema={[{ type: 'line' }]}
        data={{ items: [{ id: '1' }], meta: { legend: [{ id: '1' }], count: 1 } }}
      />
    );
    expect(screen.getByTestId('chart-builder')).toBeInTheDocument();
  });
});
