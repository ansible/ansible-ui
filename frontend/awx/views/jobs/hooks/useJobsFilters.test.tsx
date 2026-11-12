import { IView, ToolbarFilterType, buildQueryString } from '@ansible/ansible-ui-framework';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useJobsFilters } from './useJobsFilters';

const mockOptions = {
  actions: {
    GET: {
      id: { type: 'integer', label: 'ID', filterable: true },
      type: { type: 'choice', label: 'Type', filterable: true, choices: [] },
      url: { type: 'string', label: 'URL', filterable: false },
      related: { type: 'object', label: 'Related', filterable: false },
      summary_fields: { type: 'object', label: 'Summary fields', filterable: false },
      created: { type: 'datetime', label: 'Created', filterable: true },
      modified: { type: 'datetime', label: 'Modified', filterable: true },
      name: { type: 'string', label: 'Name', filterable: true },
      description: { type: 'string', label: 'Description', filterable: true },
      organization: { type: 'integer', label: 'Organization', filterable: true },
      unified_job_template: { type: 'id', label: 'Unified job template', filterable: true },
      launch_type: { type: 'choice', label: 'Launch type', filterable: true, choices: [] },
      status: { type: 'choice', label: 'Status', filterable: true, choices: [] },
      execution_environment: { type: 'id', label: 'Execution environment', filterable: true },
      failed: { type: 'boolean', label: 'Failed', filterable: true },
      started: { type: 'datetime', label: 'Started', filterable: true },
      finished: { type: 'datetime', label: 'Finished', filterable: true },
      canceled_on: { type: 'datetime', label: 'Canceled on', filterable: true },
      elapsed: { type: 'decimal', label: 'Elapsed', filterable: true },
      job_explanation: { type: 'string', label: 'Job explanation', filterable: true },
      execution_node: { type: 'string', label: 'Execution node', filterable: true },
      controller_node: { type: 'string', label: 'Controller node', filterable: true },
      work_unit_id: { type: 'string', label: 'Work unit ID', filterable: true },
      scm_type: { type: 'choice', label: 'SCM type', filterable: true, choices: [] },
      hostname: { type: 'string', label: 'Hostname', filterable: true },
      node_type: { type: 'choice', label: 'Node type', filterable: true, choices: [] },
      image_location: { type: 'string', label: 'Image location', filterable: true },
    },
  },
  search_fields: ['description', 'name'],
  related_search_fields: ['organization__search'],
};

const server = setupServer(
  http.options(awxAPI`/unified_jobs/`, () => {
    return HttpResponse.json(mockOptions);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useJobsFilters', () => {
  test('Returns expected number of filters', { timeout: 15000 }, async () => {
    const { result } = renderHook(() => useJobsFilters());

    await waitFor(
      () => {
        expect(result.current).toBeDefined();
        expect(result.current.length).toEqual(28);
      },
      { timeout: 10000 }
    );

    // 24 filterable fields from API + 4 additional filters (search, labels, launched-by, limit) = 28 total
    expect(result.current).toHaveLength(28);
  });

  test('Includes launched-by filter', { timeout: 15000 }, async () => {
    const { result } = renderHook(() => useJobsFilters());

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const launchedByFilter = result.current.find((f) => f.key === 'launched-by');
    expect(launchedByFilter).toBeDefined();
    expect(launchedByFilter?.query).toBe('created_by__username__icontains');
    expect(launchedByFilter?.label).toBe('Launched by');
  });

  test('filters jobs by a hybrid node hostname', async () => {
    server.use(
      http.get(awxAPI`/instances/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 42, hostname: 'hybrid-node.example.com', node_type: 'hybrid' }],
        })
      )
    );

    const { result } = renderHook(() => useJobsFilters());

    await waitFor(
      () => {
        expect(result.current.some((filter) => filter.key === 'execution_node')).toBe(true);
        expect(result.current.some((filter) => filter.key === 'controller_node')).toBe(true);
      },
      { timeout: 10000 }
    );

    const executionFilter = result.current.find((filter) => filter.key === 'execution_node');
    const controllerFilter = result.current.find((filter) => filter.key === 'controller_node');
    expect(executionFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);
    expect(controllerFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);
    if (
      executionFilter?.type !== ToolbarFilterType.AsyncMultiSelect ||
      controllerFilter?.type !== ToolbarFilterType.AsyncMultiSelect
    ) {
      return;
    }

    const executionOptions = await executionFilter.queryOptions({
      search: '',
      next: '',
      signal: new AbortController().signal,
    });
    const controllerOptions = await controllerFilter.queryOptions({
      search: '',
      next: '',
      signal: new AbortController().signal,
    });
    const hybridExecution = executionOptions.options.find(
      (option) => option.label === 'hybrid-node.example.com'
    );
    const hybridController = controllerOptions.options.find(
      (option) => option.label === 'hybrid-node.example.com'
    );
    expect(hybridExecution?.value).toBe('hybrid-node.example.com');
    expect(hybridController?.value).toBe('hybrid-node.example.com');
    if (!hybridExecution || !hybridController) {
      return;
    }

    const view = {
      page: 1,
      perPage: 10,
      sort: 'id',
      sortDirection: 'desc',
      filterState: {},
    } as unknown as IView;
    const executionQuery = buildQueryString(
      { ...view, filterState: { execution_node: [hybridExecution.value] } },
      result.current,
      {}
    );
    const controllerQuery = buildQueryString(
      { ...view, filterState: { controller_node: [hybridController.value] } },
      result.current,
      {}
    );

    expect(new URLSearchParams(executionQuery).getAll('execution_node')).toEqual([
      'hybrid-node.example.com',
    ]);
    expect(executionQuery).not.toContain('execution_node=42');
    expect(new URLSearchParams(controllerQuery).getAll('controller_node')).toEqual([
      'hybrid-node.example.com',
    ]);
    expect(controllerQuery).not.toContain('controller_node=42');
  });
});
