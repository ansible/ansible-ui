import { describe, expect, it, vi } from 'vitest';
import { InventorySource } from '../../../interfaces/InventorySource';
import { buildInventorySourceStatusCellProps } from './useInventorySourceColumns';

vi.mock('../inventorySources/InventorySourceDetails', () => ({
  LastJobTooltip: ({ job }: { job: { id?: number } }) => <div>{job.id}</div>,
}));

const mockGetPageUrl = (route: string, config: { params: Record<string, string | number> }) =>
  `/jobs/${config.params.id}`;

function createTestSource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    inventory: 1,
    name: 'test',
    description: 'test',
    source: 'scm',
    scm_branch: 'main',
    type: 'inventory_source' as const,
    status: 'successful',
    summary_fields: {},
    related: { schedules: '/' },
    ...overrides,
  };
}

describe('buildInventorySourceStatusCellProps', () => {
  it('uses current_job id when available', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 100 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('100');
  });

  it('falls back to last_job when current_job empty', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: { id: 200 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('200');
  });

  it('falls back to current_update when current_job and last_job empty', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: {}, current_update: { id: 300 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('300');
  });

  it('falls back to related.last_job URL when no summary fields', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: {}, current_update: {} },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/400/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('400');
  });

  it('returns undefined to when no job available', () => {
    const source = createTestSource({
      summary_fields: {},
      related: { schedules: '/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toBeUndefined();
  });

  it('respects disableLinks option', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 500 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl, true);
    expect(props.to).toBeUndefined();
    expect(props.disableLinks).toBe(true);
  });

  it('sets tooltip when job available', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 600 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeDefined();
  });

  it('has no tooltip when no job available', () => {
    const source = createTestSource({
      summary_fields: {},
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeUndefined();
  });

  it('prefers current_job over all fallbacks', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: { id: 800 },
        last_job: { id: 801 },
        current_update: { id: 802 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/803/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('800');
  });

  it('prefers last_job over current_update and URL', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: {},
        last_job: { id: 900 },
        current_update: { id: 901 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/902/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('900');
  });

  it('prefers current_update over URL', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: {},
        last_job: {},
        current_update: { id: 1000 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/1001/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('1000');
  });

  it('includes status from inventory source', () => {
    const source = createTestSource({
      status: 'error',
      summary_fields: { current_job: { id: 100 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.status).toBe('error');
  });

  it('handles null/undefined summary_fields', () => {
    const source = createTestSource({
      summary_fields: undefined,
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/500/' },
    } as Partial<InventorySource>);
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('500');
  });

  it('handles null/undefined related', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 600 } },
      related: undefined,
    } as Partial<InventorySource>);
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('600');
  });

  it('sets tooltipId from lastJob', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 700 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltipId).toBe(700);
  });
});
