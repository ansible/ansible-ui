import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import { useLabelPayload } from './useLabelPayload';

const existingLabels = [
  { id: 10, name: 'production' },
  { id: 11, name: 'staging' },
];

const mockTemplate = {
  id: 1,
  summary_fields: {
    organization: { id: 5, name: 'Default' },
    labels: {
      count: 1,
      results: [{ id: 100, name: 'template-label' }],
    },
  },
} as unknown as JobTemplate;

const server = setupServer(
  http.get(awxAPI`/labels/`, ({ request }) => {
    const url = new URL(request.url);
    const pageSize = url.searchParams.get('page_size');
    if (pageSize === '200') {
      return HttpResponse.json({ count: 2, results: existingLabels, next: null });
    }
    return HttpResponse.json({ count: 2, results: existingLabels, next: null });
  }),
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.post(awxAPI`/labels/`, async ({ request }) => {
    const body = (await request.json()) as { name: string; organization: number };
    return HttpResponse.json(
      { id: 999, name: body.name, organization: body.organization },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useLabelPayload', () => {
  it('should return template label IDs when no prompt labels provided', async () => {
    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([], mockTemplate);
    expect(labelIds).toContain(100);
  });

  it('should include prompt labels with existing IDs', async () => {
    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([{ name: 'production', id: 10 }], mockTemplate);
    expect(labelIds).toContain(100);
    expect(labelIds).toContain(10);
  });

  it('should resolve existing labels by name without creating new ones', async () => {
    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([{ name: 'production' }], mockTemplate);
    expect(labelIds).toContain(100);
    expect(labelIds).toContain(10);
  });

  it('should create new labels when name does not exist', async () => {
    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([{ name: 'brand-new-label' }], mockTemplate);
    expect(labelIds).toContain(100);
    expect(labelIds).toContain(999);
  });

  it('should fetch default organization when template has none', async () => {
    const templateNoOrg = {
      ...mockTemplate,
      summary_fields: {
        ...mockTemplate.summary_fields,
        organization: undefined,
      },
    } as unknown as JobTemplate;

    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([{ name: 'new-label' }], templateNoOrg);
    expect(labelIds).toContain(999);
  });

  it('should throw when template has no org and no organizations are accessible', async () => {
    server.use(
      http.get(awxAPI`/organizations/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    const templateNoOrg = {
      ...mockTemplate,
      summary_fields: {
        ...mockTemplate.summary_fields,
        organization: undefined,
      },
    } as unknown as JobTemplate;

    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    await expect(result.current([{ name: 'new-label' }], templateNoOrg)).rejects.toThrow(
      'Cannot create label: this template has no organization and no organizations are accessible.'
    );
  });

  it('should handle label creation failure gracefully', async () => {
    server.use(http.post(awxAPI`/labels/`, () => HttpResponse.json({}, { status: 500 })));

    const { result } = renderHook(() => useLabelPayload());

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Function);
    });

    const labelIds = await result.current([{ name: 'fail-label' }], mockTemplate);
    expect(labelIds).toContain(100);
  });
});
