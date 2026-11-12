/* eslint-disable i18next/no-literal-string */
import { render, screen, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Repository } from '../Repository';
import { useRepositoriesColumns } from './useRepositoriesColumns';

const baseRepository: Repository = {
  name: 'published',
  description: '',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/123/',
  pulp_created: '2024-01-01T00:00:00Z',
  pulp_labels: {},
  private: true,
  retain_repo_versions: 1,
  remote: '/pulp/api/v3/remotes/ansible/collection/1/',
  gpgkey: null,
  last_sync_task: {
    state: 'completed',
    task_id: '1',
    started_at: '2024-01-01T00:00:00Z',
    finished_at: '2024-01-01T00:01:00Z',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  versions_href: '',
};

describe('useRepositoriesColumns', () => {
  it('renders repository table cells for sync and label states', () => {
    const { result } = renderHook(() => useRepositoriesColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const repoWithLabels: Repository = {
      ...baseRepository,
      pulp_labels: { pipeline: 'staging', hide_from_search: '' },
    };

    const nameColumn = result.current.find((col) => col.header === 'Name');
    const labelsColumn = result.current.find((col) => col.header === 'Labels');
    const privateColumn = result.current.find((col) => col.header === 'Private');
    const syncColumn = result.current.find((col) => col.header === 'Sync status');
    const createdColumn = result.current.find((col) => col.header === 'Created');

    if (nameColumn && 'cell' in nameColumn && nameColumn.cell) {
      render(<MemoryRouter>{nameColumn.cell(baseRepository)}</MemoryRouter>);
      expect(screen.getByText('published')).toBeInTheDocument();
    }

    if (labelsColumn && 'cell' in labelsColumn && labelsColumn.cell) {
      render(
        <MemoryRouter>{labelsColumn.cell({ ...baseRepository, pulp_labels: {} })}</MemoryRouter>
      );
      expect(screen.getByText('None')).toBeInTheDocument();

      render(<MemoryRouter>{labelsColumn.cell(repoWithLabels)}</MemoryRouter>);
      expect(screen.getByText('pipeline: staging')).toBeInTheDocument();
      expect(screen.getByText('hide_from_search')).toBeInTheDocument();
    }

    if (privateColumn && 'cell' in privateColumn && privateColumn.cell) {
      render(<MemoryRouter>{privateColumn.cell(baseRepository)}</MemoryRouter>);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    }

    if (syncColumn && 'cell' in syncColumn && syncColumn.cell) {
      render(<MemoryRouter>{syncColumn.cell({ ...baseRepository, remote: null })}</MemoryRouter>);
      expect(screen.getByText('No remote')).toBeInTheDocument();

      render(
        <MemoryRouter>
          {syncColumn.cell({ ...baseRepository, last_sync_task: null as never })}
        </MemoryRouter>
      );
      expect(screen.getByText('Never synced')).toBeInTheDocument();
    }

    if (createdColumn && 'cell' in createdColumn && createdColumn.cell) {
      render(<MemoryRouter>{createdColumn.cell(baseRepository)}</MemoryRouter>);
    }
  });
});
