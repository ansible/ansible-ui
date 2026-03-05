import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { IAwxDashboardData } from '../AwxOverview';
import { AwxCountsCard } from './AwxCountsCard';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl: () => (path: string) => `/mock/${path}`,
  };
});

vi.mock('@ansible/ansible-ui-framework/PageDashboard/usePageChartColors', () => ({
  usePageChartColors: () => ({ successfulColor: 'green', failedColor: 'red' }),
}));

describe('AwxCountsCard', () => {
  it('should render counts card with Hosts and Projects titles', () => {
    const data = {
      hosts: { total: 2, failed: 0 },
      projects: { total: 1, failed: 0 },
      inventories: { total: 0, inventory_failed: 0 },
    } as unknown as IAwxDashboardData;
    render(
      <MemoryRouter>
        <AwxCountsCard data={data} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('hosts')).toHaveTextContent('Hosts');
    expect(screen.getByTestId('resource-count-bar')).toBeInTheDocument();
  });
});
