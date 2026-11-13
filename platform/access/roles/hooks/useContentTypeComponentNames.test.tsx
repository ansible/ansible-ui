import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { useContentTypeComponentNames } from './useContentTypeComponentNames';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useContentTypeComponentNames', () => {
  test('maps component names by content type prefix', () => {
    const { result } = renderHook(() => useContentTypeComponentNames());
    const getNames = result.current;

    expect(getNames('awx.project' as never)).toEqual(['Automation Execution']);
    expect(getNames('eda.project' as never)).toEqual(['Automation Decisions']);
    expect(getNames('galaxy.namespace' as never)).toEqual(['Automation Content']);
  });

  test('maps shared organization to execution and decisions', () => {
    const { result } = renderHook(() => useContentTypeComponentNames());
    expect(result.current(SharedContentType.Organization as never)).toEqual([
      'Automation Execution',
      'Automation Decisions',
    ]);
  });

  test('maps other shared types to all components', () => {
    const { result } = renderHook(() => useContentTypeComponentNames());
    expect(result.current('shared.team' as never)).toEqual([
      'Automation Execution',
      'Automation Decisions',
      'Automation Content',
    ]);
  });
});
