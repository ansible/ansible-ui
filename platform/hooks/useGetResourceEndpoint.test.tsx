import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useGetResourceEndpoint } from './useGetResourceEndpoint';

describe('useGetResourceEndpoint', () => {
  test('should return undefined when content type or object id is null', () => {
    const { result: missingType } = renderHook(() => useGetResourceEndpoint(null, 1));
    const { result: missingId } = renderHook(() => useGetResourceEndpoint('awx.project', null));

    expect(missingType.current).toBeUndefined();
    expect(missingId.current).toBeUndefined();
  });

  test('should map known content types to API endpoints', () => {
    const { result: awxProject } = renderHook(() => useGetResourceEndpoint('awx.project', 42));
    const { result: gatewayTeam } = renderHook(() =>
      useGetResourceEndpoint('shared.team', 'ansible-id')
    );

    expect(awxProject.current).toContain('/projects');
    expect(gatewayTeam.current).toContain('/teams');
  });

  test('should return undefined for unknown content types', () => {
    const { result } = renderHook(() => useGetResourceEndpoint('unknown.model', 1));

    expect(result.current).toBeUndefined();
  });
});
