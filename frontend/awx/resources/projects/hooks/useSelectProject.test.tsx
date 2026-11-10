import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSelectProject } from './useSelectProject';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
  };
});

vi.mock('@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog', () => ({
  SingleSelectDialog: () => <div data-testid="single-select-dialog" />,
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: () => ({ data: [], error: undefined, isLoading: false }),
}));

vi.mock('./useProjectsColumns', () => ({
  useProjectsColumns: () => [],
}));

vi.mock('./useProjectsFilters', () => ({
  useProjectsFilters: () => [],
}));

describe('useSelectProject', () => {
  it('opens the select project dialog', () => {
    const { result } = renderHook(() => useSelectProject());

    result.current(vi.fn());

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });
});
