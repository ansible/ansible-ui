/* eslint-disable i18next/no-literal-string */
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  dashboardFilterSetKey,
  dashboardFilterStateKey,
  isDashboardFilterSetShape,
  isFilterStateShape,
  readPersistedFilterSet,
  readPersistedFilterState,
  writePersistedFilterSet,
  writePersistedFilterState,
} from './persistedFilterState';

const USER_ID = 42;
const OTHER_USER_ID = 7;

const filterSet = {
  id: 3,
  name: 'Weekly ops',
  filters: '{"period":["last_7_days"]}',
  is_default: false,
};

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('storage keys', () => {
  test('should namespace keys by user id', () => {
    expect(dashboardFilterStateKey(USER_ID)).toBe('awx-automation-dashboard-filter-state:42');
    expect(dashboardFilterSetKey(USER_ID)).toBe('awx-automation-dashboard-filter-set:42');
    expect(dashboardFilterStateKey(OTHER_USER_ID)).not.toBe(dashboardFilterStateKey(USER_ID));
  });
});

describe('isFilterStateShape', () => {
  test('should accept a record of string arrays', () => {
    expect(isFilterStateShape({ period: ['last_30_days'], template: ['1', '2'] })).toBe(true);
  });

  test('should accept an empty object', () => {
    expect(isFilterStateShape({})).toBe(true);
  });

  test('should reject non-objects', () => {
    expect(isFilterStateShape(null)).toBe(false);
    expect(isFilterStateShape('period')).toBe(false);
    expect(isFilterStateShape(['period'])).toBe(false);
  });

  test('should reject values that are not string arrays', () => {
    expect(isFilterStateShape({ period: 'last_30_days' })).toBe(false);
    expect(isFilterStateShape({ period: [1, 2] })).toBe(false);
    expect(isFilterStateShape({ period: [null] })).toBe(false);
  });
});

describe('readPersistedFilterState', () => {
  test('should return undefined when nothing is stored for the user', () => {
    expect(readPersistedFilterState(USER_ID)).toBeUndefined();
  });

  test('should return the state stored for that user', () => {
    sessionStorage.setItem(
      dashboardFilterStateKey(USER_ID),
      JSON.stringify({ period: ['last_30_days'], template: ['5'] })
    );

    expect(readPersistedFilterState(USER_ID)).toEqual({
      period: ['last_30_days'],
      template: ['5'],
    });
  });

  test('should not read another user state', () => {
    sessionStorage.setItem(
      dashboardFilterStateKey(OTHER_USER_ID),
      JSON.stringify({ period: ['last_90_days'] })
    );

    expect(readPersistedFilterState(USER_ID)).toBeUndefined();
  });

  test('should drop empty filter entries', () => {
    sessionStorage.setItem(
      dashboardFilterStateKey(USER_ID),
      JSON.stringify({ period: ['last_30_days'], template: [] })
    );

    expect(readPersistedFilterState(USER_ID)).toEqual({ period: ['last_30_days'] });
  });

  test('should return undefined when every filter is empty', () => {
    sessionStorage.setItem(
      dashboardFilterStateKey(USER_ID),
      JSON.stringify({ period: [], template: [] })
    );

    expect(readPersistedFilterState(USER_ID)).toBeUndefined();
  });

  test('should return undefined for malformed JSON', () => {
    sessionStorage.setItem(dashboardFilterStateKey(USER_ID), 'not json');

    expect(readPersistedFilterState(USER_ID)).toBeUndefined();
  });

  test('should return undefined for a payload with the wrong shape', () => {
    sessionStorage.setItem(
      dashboardFilterStateKey(USER_ID),
      JSON.stringify({ period: 'last_30_days' })
    );

    expect(readPersistedFilterState(USER_ID)).toBeUndefined();
  });
});

describe('writePersistedFilterState', () => {
  test('should round-trip through readPersistedFilterState for the same user', () => {
    writePersistedFilterState({ period: ['custom', '2024-01-01'], organization: ['3'] }, USER_ID);

    expect(readPersistedFilterState(USER_ID)).toEqual({
      period: ['custom', '2024-01-01'],
      organization: ['3'],
    });
    expect(readPersistedFilterState(OTHER_USER_ID)).toBeUndefined();
  });

  test('should do nothing when given undefined', () => {
    writePersistedFilterState(undefined, USER_ID);

    expect(sessionStorage.getItem(dashboardFilterStateKey(USER_ID))).toBeNull();
  });

  test('should not throw when sessionStorage rejects the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writePersistedFilterState({ period: ['last_7_days'] }, USER_ID)).not.toThrow();
  });
});

describe('isDashboardFilterSetShape', () => {
  test('should accept a well-formed filter set', () => {
    expect(isDashboardFilterSetShape(filterSet)).toBe(true);
  });

  test('should reject objects with missing or wrongly typed fields', () => {
    expect(isDashboardFilterSetShape({ ...filterSet, id: '3' })).toBe(false);
    expect(isDashboardFilterSetShape({ ...filterSet, filters: {} })).toBe(false);
    expect(isDashboardFilterSetShape({ id: 3, name: 'x' })).toBe(false);
    expect(isDashboardFilterSetShape(null)).toBe(false);
  });
});

describe('readPersistedFilterSet / writePersistedFilterSet', () => {
  test('should round-trip a filter set for the same user only', () => {
    writePersistedFilterSet(filterSet, USER_ID);

    expect(readPersistedFilterSet(USER_ID)).toEqual(filterSet);
    expect(readPersistedFilterSet(OTHER_USER_ID)).toBeUndefined();
  });

  test('should clear the stored selection when given undefined', () => {
    writePersistedFilterSet(filterSet, USER_ID);
    writePersistedFilterSet(undefined, USER_ID);

    expect(readPersistedFilterSet(USER_ID)).toBeUndefined();
    expect(sessionStorage.getItem(dashboardFilterSetKey(USER_ID))).toBeNull();
  });

  test('should return undefined for a malformed payload', () => {
    sessionStorage.setItem(dashboardFilterSetKey(USER_ID), '{"id":');

    expect(readPersistedFilterSet(USER_ID)).toBeUndefined();
  });

  test('should return undefined when the stored object has the wrong shape', () => {
    sessionStorage.setItem(dashboardFilterSetKey(USER_ID), JSON.stringify({ id: 3 }));

    expect(readPersistedFilterSet(USER_ID)).toBeUndefined();
  });
});
