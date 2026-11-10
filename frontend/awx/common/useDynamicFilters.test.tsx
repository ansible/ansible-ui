import { renderHook, waitFor } from '@testing-library/react';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { isValidElement } from 'react';
import { setupServer } from 'msw/node';
import { knownAwxFilterKeys, useDynamicToolbarFilters, useFilters } from './useDynamicFilters';
import { awxAPI } from './api/awx-utils';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SwrTestWrapper>{children}</SwrTestWrapper>;
}

const server = setupServer(
  http.options(awxAPI`/jobs/`, () =>
    HttpResponse.json({
      actions: {
        GET: {
          name: { filterable: true, type: 'string', label: 'Name' },
          status: {
            filterable: true,
            type: 'choice',
            label: 'Status',
            choices: [
              ['successful', 'Successful'],
              ['failed', 'Failed'],
            ],
          },
          enabled: { filterable: true, type: 'boolean', label: 'Enabled' },
          created: { filterable: true, type: 'datetime', label: 'Created' },
          organization: { filterable: true, type: 'integer', label: 'Organization' },
        },
      },
    })
  )
);

describe('useDynamicFilters', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('useFilters', () => {
    it('returns empty array when actions are undefined', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });
      expect(result.current).toEqual([]);
    });

    it('maps filterable fields from actions', () => {
      const actions = {
        name: { filterable: true, type: 'string', label: 'Name', required: false },
        hidden: { filterable: false, type: 'string', label: 'Hidden', required: false },
      };
      const { result } = renderHook(() => useFilters(actions), { wrapper });
      expect(result.current).toHaveLength(1);
      expect(result.current[0].key).toBe('name');
    });
  });

  describe('useDynamicToolbarFilters', () => {
    it('builds filters from options endpoint', async () => {
      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
            preSortedKeys: ['status', 'name'],
            removeFilters: ['enabled'],
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.length).toBeGreaterThan(0);
      });

      const keys = result.current.map((filter) => filter.key);
      expect(keys).toContain('name');
      expect(keys).toContain('status');
      expect(keys).not.toContain('enabled');

      const statusFilter = result.current.find((filter) => filter.key === 'status');
      expect(statusFilter?.type).toBe(ToolbarFilterType.MultiSelect);

      const createdFilter = result.current.find((filter) => filter.key === 'created');
      expect(createdFilter?.type).toBe(ToolbarFilterType.DateRange);

      const organizationFilter = result.current.find((filter) => filter.key === 'organization');
      expect(organizationFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);
    });

    it('loads async organization options', async () => {
      server.use(
        http.get(awxAPI`/organizations/`, () =>
          HttpResponse.json({
            count: 1,
            results: [{ id: 5, name: 'Default' }],
          })
        )
      );

      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        const organizationFilter = result.current.find((filter) => filter.key === 'organization');
        expect(
          organizationFilter?.type === ToolbarFilterType.AsyncMultiSelect &&
            organizationFilter.queryOptions
        ).toBeTruthy();
      });

      const organizationFilter = result.current.find((filter) => filter.key === 'organization');
      if (organizationFilter?.type === ToolbarFilterType.AsyncMultiSelect) {
        const options = await organizationFilter.queryOptions({
          search: 'Def',
          next: '',
          signal: new AbortController().signal,
        });
        expect(options.options).toEqual([{ label: 'Default', value: '5' }]);

        const label = organizationFilter.queryLabel('5');
        expect(isValidElement(label) && label.type === AsyncQueryLabel).toBe(true);
        if (isValidElement(label)) {
          expect(label.props).toMatchObject({ id: '5', field: 'name' });
        }
      }
    });

    it('includes additional filters in the toolbar', async () => {
      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
            additionalFilters: [
              { key: 'custom', label: 'Custom', type: ToolbarFilterType.Search, query: 'search' },
            ],
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.some((filter) => filter.key === 'custom')).toBe(true);
      });
    });

    it('maps boolean fields to single-select filters', async () => {
      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        const enabledFilter = result.current.find((filter) => filter.key === 'enabled');
        expect(enabledFilter?.type).toBe(ToolbarFilterType.SingleSelect);
      });
    });

    it('maps string fields without async keys to multi-text filters', async () => {
      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        const nameFilter = result.current.find((filter) => filter.key === 'name');
        expect(nameFilter?.type).toBe(ToolbarFilterType.MultiText);
      });
    });

    it('requests the next page of async options when next is set', async () => {
      const requestedUrls: string[] = [];
      server.use(
        http.get(awxAPI`/organizations/`, ({ request }) => {
          requestedUrls.push(request.url);
          if (request.url.includes('organization__gt=5')) {
            return HttpResponse.json({
              count: 2,
              results: [{ id: 10, name: 'Next Org' }],
            });
          }
          return HttpResponse.json({
            count: 2,
            results: [{ id: 5, name: 'Default' }],
          });
        })
      );

      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.some((filter) => filter.key === 'organization')).toBe(true);
      });

      const organizationFilter = result.current.find((filter) => filter.key === 'organization');
      if (organizationFilter?.type === ToolbarFilterType.AsyncMultiSelect) {
        await organizationFilter.queryOptions({
          search: '',
          next: '5',
          signal: new AbortController().signal,
        });
        expect(requestedUrls.some((url) => url.includes('id__gt=5'))).toBe(true);
      }
    });
  });

  describe('knownAwxFilterKeys', () => {
    it('includes credential and organization endpoints', () => {
      expect(knownAwxFilterKeys.organization.apiPath).toBe('organizations');
      expect(knownAwxFilterKeys.credential.apiPath).toBe('credentials');
    });

    it('uses hostname as both label and value key for execution_node', () => {
      const config = knownAwxFilterKeys.execution_node;
      expect(config.apiPath).toBe('instances');
      expect(config.labelKey).toBe('hostname');
      expect(config.valueKey).toBe('hostname');
    });

    it('uses hostname as both label and value key for controller_node', () => {
      const config = knownAwxFilterKeys.controller_node;
      expect(config.apiPath).toBe('instances');
      expect(config.labelKey).toBe('hostname');
      expect(config.valueKey).toBe('hostname');
    });

    it('includes hybrid nodes in the execution_node instance query', () => {
      expect(knownAwxFilterKeys.execution_node.queryParams).toEqual({
        or__node_type: ['execution', 'hybrid'],
      });
    });

    it('includes hybrid nodes in the controller_node instance query', () => {
      expect(knownAwxFilterKeys.controller_node.queryParams).toEqual({
        or__node_type: ['control', 'hybrid'],
      });
    });
  });

  describe('execution_node and controller_node async filters', () => {
    it('populates execution_node options with hostname values', async () => {
      const requestedUrls: string[] = [];
      server.use(
        http.options(awxAPI`/unified_jobs/`, () =>
          HttpResponse.json({
            actions: {
              GET: {
                execution_node: { filterable: true, type: 'string', label: 'Execution node' },
              },
            },
          })
        ),
        http.get(awxAPI`/instances/`, ({ request }) => {
          requestedUrls.push(request.url);
          return HttpResponse.json({
            count: 2,
            results: [
              { id: 1, hostname: 'exec-node-1.example.com', node_type: 'execution' },
              { id: 2, hostname: 'hybrid-node-1.example.com', node_type: 'hybrid' },
            ],
          });
        })
      );

      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'unified_jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.some((f) => f.key === 'execution_node')).toBe(true);
      });

      const execFilter = result.current.find((f) => f.key === 'execution_node');
      expect(execFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);

      if (execFilter?.type === ToolbarFilterType.AsyncMultiSelect) {
        const options = await execFilter.queryOptions({
          search: '',
          next: '',
          signal: new AbortController().signal,
        });
        expect(options.options).toEqual([
          { label: 'exec-node-1.example.com', value: 'exec-node-1.example.com' },
          { label: 'hybrid-node-1.example.com', value: 'hybrid-node-1.example.com' },
        ]);
        expect(execFilter.queryLabel('exec-node-1.example.com')).toBe('exec-node-1.example.com');
        const params = new URL(requestedUrls[0]).searchParams;
        expect(params.getAll('or__node_type')).toEqual(['execution', 'hybrid']);
        expect(params.getAll('node_type')).toEqual([]);
      }
    });

    it('populates controller_node options with hostname values', async () => {
      const requestedUrls: string[] = [];
      server.use(
        http.options(awxAPI`/unified_jobs/`, () =>
          HttpResponse.json({
            actions: {
              GET: {
                controller_node: { filterable: true, type: 'string', label: 'Controller node' },
              },
            },
          })
        ),
        http.get(awxAPI`/instances/`, ({ request }) => {
          requestedUrls.push(request.url);
          return HttpResponse.json({
            count: 2,
            results: [
              { id: 3, hostname: 'control-node-1.example.com', node_type: 'control' },
              { id: 4, hostname: 'hybrid-node-2.example.com', node_type: 'hybrid' },
            ],
          });
        })
      );

      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'unified_jobs',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.some((f) => f.key === 'controller_node')).toBe(true);
      });

      const ctrlFilter = result.current.find((f) => f.key === 'controller_node');
      expect(ctrlFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);

      if (ctrlFilter?.type === ToolbarFilterType.AsyncMultiSelect) {
        const options = await ctrlFilter.queryOptions({
          search: '',
          next: '',
          signal: new AbortController().signal,
        });
        expect(options.options).toEqual([
          { label: 'control-node-1.example.com', value: 'control-node-1.example.com' },
          { label: 'hybrid-node-2.example.com', value: 'hybrid-node-2.example.com' },
        ]);
        expect(ctrlFilter.queryLabel('control-node-1.example.com')).toBe(
          'control-node-1.example.com'
        );
        const params = new URL(requestedUrls[0]).searchParams;
        expect(params.getAll('or__node_type')).toEqual(['control', 'hybrid']);
        expect(params.getAll('node_type')).toEqual([]);
      }
    });

    it('returns the raw value when a prefilled filter omits label and value keys', async () => {
      server.use(
        http.options(awxAPI`/jobs/`, () =>
          HttpResponse.json({
            actions: {
              GET: {
                custom_name: { filterable: true, type: 'string', label: 'Custom name' },
              },
            },
          })
        )
      );

      const { result } = renderHook(
        () =>
          useDynamicToolbarFilters({
            optionsPath: 'jobs',
            preFilledValueKeys: {
              custom_name: { apiPath: 'unified_jobs' },
            },
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.some((filter) => filter.key === 'custom_name')).toBe(true);
      });

      const customFilter = result.current.find((filter) => filter.key === 'custom_name');
      expect(customFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);
      if (customFilter?.type === ToolbarFilterType.AsyncMultiSelect) {
        expect(customFilter.queryLabel('already-a-label')).toBe('already-a-label');
      }
    });
  });
});
