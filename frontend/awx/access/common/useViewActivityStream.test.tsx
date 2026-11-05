import { PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { useViewActivityStream } from './useViewActivityStream';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

describe('useViewActivityStream', () => {
  const pageNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(pageNavigate);
  });

  it('returns activity stream action that navigates with query type', () => {
    const { result } = renderHook(() => useViewActivityStream('organization'));
    const action = result.current[0];
    expect(action.type).toBe(PageActionType.Button);
    if ('onClick' in action && typeof action.onClick === 'function') {
      action.onClick({} as never);
    }
    expect(pageNavigate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ query: { type: 'organization' } })
    );
  });
});
