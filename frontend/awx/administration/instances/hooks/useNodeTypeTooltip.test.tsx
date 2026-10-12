import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useNodeTypeTooltip } from './useNodeTypeTooltip';

describe('useNodeTypeTooltip', () => {
  test('returns tooltip copy for each node type', () => {
    const { result } = renderHook(() => useNodeTypeTooltip());

    expect(Object.keys(result.current).sort()).toEqual(['control', 'execution', 'hop', 'hybrid']);
    expect(result.current.hybrid).toContain('Hybrid');
    expect(result.current.execution).toContain('Execution nodes');
    expect(result.current.hop).toContain('hop nodes');
    expect(result.current.control).toContain('Control nodes');
  });
});
