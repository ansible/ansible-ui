import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useOrganizationNameColumn } from './columns';

type OrganizationRow = {
  summary_fields?: {
    organization?: {
      id: number;
      name: string;
    } | null;
  };
};

describe('useOrganizationNameColumn', () => {
  test('supports typed rows with or without an organization', () => {
    const { result } = renderHook(() =>
      useOrganizationNameColumn<OrganizationRow>('organization-details', {
        disableLinks: true,
      })
    );

    expect(result.current.sort).toBe('organization');
    expect(
      result.current.value?.({ summary_fields: { organization: { id: 7, name: 'Engineering' } } })
    ).toBe('Engineering');
    expect(result.current.value?.({ summary_fields: { organization: null } })).toBeUndefined();
    expect(result.current.cell?.({ summary_fields: {} })).toBeDefined();
  });

  test('uses the default value for rows without an organization', () => {
    const { result } = renderHook(() =>
      useOrganizationNameColumn<OrganizationRow>('organization-details', undefined, 'Global')
    );

    expect(result.current.cell?.({ summary_fields: { organization: null } })).toBeDefined();
  });
});
