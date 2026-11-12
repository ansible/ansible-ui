import { describe, expect, it, vi } from 'vitest';
import { ApiType, GroupedApi } from './types';
import { convertApiToData, convertGroupedByData } from './convertApi';

vi.mock('@ansible/ansible-ui-framework/utils/randomUUID', () => ({
  randomUUID: vi.fn(() => 'uuid-1'),
}));

describe('convertApi', () => {
  it('converts grouped API responses into chart series', () => {
    const grouped = {
      dates: [
        {
          date: '2024-01-01',
          items: [{ id: 'a', name: 'A' }],
        },
        {
          date: '2024-01-02',
          items: [{ id: 'a', name: 'A' }],
        },
      ],
      meta: { legend: [{ id: 'a', name: 'A' }], count: 2 },
    };

    const series = convertGroupedByData(grouped);
    expect(series).toHaveLength(1);
    expect(series[0].serie).toHaveLength(2);
    expect(series[0].serie[0].created_date).toBe('2024-01-01');
  });

  it('converts non-grouped API responses', () => {
    const result = convertApiToData({
      items: [{ id: 'x', name: 'Item' }],
      meta: { legend: [{ id: 'x', name: 'Item' }], count: 1 },
    });

    expect(result.series).toHaveLength(1);
    expect(result.series[0].serie).toHaveLength(1);
    expect(result.legend?.[0].childName).toBe('uuid-1');
  });

  it('marks grouped payloads with grouped type', () => {
    const payload: GroupedApi = {
      dates: [],
      meta: { legend: [], count: 0 },
    };
    convertApiToData(payload);
    expect(payload.type).toBe(ApiType.grouped);
  });
});
