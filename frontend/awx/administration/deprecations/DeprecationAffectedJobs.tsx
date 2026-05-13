import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Pagination,
  PageSection,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../main/AwxRoutes';
import { useDeprecationData } from './hooks/useDeprecationData';

interface MockJob {
  id: number;
  name: string;
  status: 'successful' | 'failed' | 'running';
  started: string;
  finished: string;
  template: string;
}

function makeMockJob(id: number): MockJob {
  const statuses: MockJob['status'][] = ['successful', 'failed', 'running'];
  const templates = [
    'Deploy Web App',
    'Update System Packages',
    'Configure Firewall',
    'Provision DB Server',
    'Sync Inventory',
  ];
  const daysAgo = (id % 7) + 1;
  const started = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const finished = new Date(Date.now() - daysAgo * 86400000 + 300000).toISOString();
  return {
    id,
    name: `Job #${id}`,
    status: statuses[id % 3],
    started,
    finished,
    template: templates[id % templates.length],
  };
}

type SortDirection = 'asc' | 'desc';

export function DeprecationAffectedJobs() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const decodedType = decodeURIComponent(deprecationType ?? '');
  const getPageUrl = useGetPageUrl();

  const { data } = useDeprecationData();
  const deprecation = data?.deprecations.find((d) => d.type === decodedType);
  const jobs: MockJob[] = useMemo(
    () => (deprecation?.jobIds ?? []).map(makeMockJob),
    [deprecation]
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return jobs.filter(
      (j) =>
        !lower ||
        j.name.toLowerCase().includes(lower) ||
        j.template.toLowerCase().includes(lower) ||
        j.status.toLowerCase().includes(lower)
    );
  }, [jobs, search]);

  const sorted = useMemo(() => {
    if (sortIndex === null) return filtered;
    return [...filtered].sort((a, b) => {
      const keys: (keyof MockJob)[] = ['id', 'name', 'template', 'status', 'started'];
      const key = keys[sortIndex];
      const av = String(a[key]);
      const bv = String(b[key]);
      return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortIndex, sortDirection]);

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: { index: sortIndex ?? undefined, direction: sortDirection },
    onSort: (_e, index, direction) => {
      setSortIndex(index);
      setSortDirection(direction);
    },
    columnIndex,
  });

  const statusColor: Record<MockJob['status'], string> = {
    successful: 'var(--pf-t--global--color--status--success--default)',
    failed: 'var(--pf-t--global--color--status--danger--default)',
    running: 'var(--pf-t--global--color--status--info--default)',
  };

  return (
    <PageSection>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder={t('Search by name, template, or status')}
              value={search}
              onChange={(_e, val) => {
                setSearch(val);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              style={{ minWidth: '280px' }}
            />
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filtered.length}
              page={page}
              perPage={perPage}
              onSetPage={(_e, p) => setPage(p)}
              onPerPageSelect={(_e, pp) => {
                setPerPage(pp);
                setPage(1);
              }}
              variant="top"
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table variant="compact" aria-label={t('Affected jobs')}>
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>{t('ID')}</Th>
            <Th sort={getSortParams(1)}>{t('Name')}</Th>
            <Th sort={getSortParams(2)}>{t('Template')}</Th>
            <Th sort={getSortParams(3)}>{t('Status')}</Th>
            <Th sort={getSortParams(4)}>{t('Started')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.length === 0 ? (
            <Tr>
              <Td
                colSpan={5}
                style={{ textAlign: 'center', color: 'var(--pf-t--global--text--color--subtle)' }}
              >
                {t('No jobs match the current filter')}
              </Td>
            </Tr>
          ) : (
            paginated.map((job) => (
              <Tr key={job.id}>
                <Td>
                  <a href={getPageUrl(AwxRoute.JobDetails, { params: { id: job.id } })}>{job.id}</a>
                </Td>
                <Td>{job.name}</Td>
                <Td>{job.template}</Td>
                <Td>
                  <span
                    style={{
                      color: statusColor[job.status],
                      fontWeight: 'var(--pf-t--global--font--weight--semi-bold)',
                    }}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </Td>
                <Td>{new Date(job.started).toLocaleString()}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filtered.length}
              page={page}
              perPage={perPage}
              onSetPage={(_e, p) => setPage(p)}
              onPerPageSelect={(_e, pp) => {
                setPerPage(pp);
                setPage(1);
              }}
              variant="bottom"
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
}
