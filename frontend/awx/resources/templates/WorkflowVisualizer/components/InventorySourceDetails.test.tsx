import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: vi.fn(() => ({
    data: {
      actions: {
        GET: {
          source: {
            choices: [
              ['scm', 'Sourced from a Project'],
              ['ec2', 'Amazon EC2'],
              ['gce', 'Google Compute Engine'],
            ],
          },
        },
      },
    },
  })),
}));

vi.mock('../../../../common/useVerbosityString', () => ({
  useVerbosityString: vi.fn((val: number) => `${val} (Normal)`),
}));

import type { InventorySource } from '../../../../interfaces/InventorySource';
import { InventorySourceDetails } from './InventorySourceDetails';

function makeSource(overrides: Record<string, unknown> = {}): InventorySource {
  return {
    id: 1,
    name: 'AWS Source',
    source: 'ec2',
    source_path: 'inventory/aws.yml',
    verbosity: 0,
    scm_branch: 'develop',
    update_cache_timeout: 300,
    summary_fields: {
      organization: { id: 1, name: 'Test Org' },
      inventory: { id: 2, name: 'My Inventory' },
      source_project: { id: 3, name: 'Source Project' },
    },
    ...overrides,
  } as unknown as InventorySource;
}

function renderComponent(source: InventorySource) {
  return render(
    <MemoryRouter>
      <InventorySourceDetails source={source} />
    </MemoryRouter>
  );
}

describe('InventorySourceDetails', () => {
  it('should render the organization name', () => {
    renderComponent(makeSource());
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });

  it('should render the inventory name', () => {
    renderComponent(makeSource());
    expect(screen.getByText('My Inventory')).toBeInTheDocument();
  });

  it('should render the source project name', () => {
    renderComponent(makeSource());
    expect(screen.getByText('Source Project')).toBeInTheDocument();
  });

  it('should render the source type from options', () => {
    renderComponent(makeSource());
    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
  });

  it('should render the inventory file path', () => {
    renderComponent(makeSource());
    expect(screen.getByText('inventory/aws.yml')).toBeInTheDocument();
  });

  it('should render "/ (project root)" when source_path is empty', () => {
    renderComponent(makeSource({ source_path: '' }));
    expect(screen.getByText('/ (project root)')).toBeInTheDocument();
  });

  it('should render the verbosity string', () => {
    renderComponent(makeSource());
    expect(screen.getByText('0 (Normal)')).toBeInTheDocument();
  });

  it('should render the scm branch', () => {
    renderComponent(makeSource());
    expect(screen.getByText('develop')).toBeInTheDocument();
  });

  it('should render the cache timeout', () => {
    renderComponent(makeSource());
    expect(screen.getByText('300 seconds')).toBeInTheDocument();
  });

  it('should hide organization section when missing', () => {
    renderComponent(
      makeSource({
        summary_fields: {
          organization: undefined,
          inventory: { id: 2, name: 'My Inventory' },
          source_project: { id: 3, name: 'Source Project' },
        },
      })
    );
    expect(screen.queryByText('Organization')).not.toBeInTheDocument();
  });

  it('should hide inventory section when missing', () => {
    renderComponent(
      makeSource({
        summary_fields: {
          organization: { id: 1, name: 'Test Org' },
          inventory: undefined,
          source_project: { id: 3, name: 'Source Project' },
        },
      })
    );
    expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
  });

  it('should hide project section when missing', () => {
    renderComponent(
      makeSource({
        summary_fields: {
          organization: { id: 1, name: 'Test Org' },
          inventory: { id: 2, name: 'My Inventory' },
          source_project: undefined,
        },
      })
    );
    expect(screen.queryByText('Project')).not.toBeInTheDocument();
  });
});
