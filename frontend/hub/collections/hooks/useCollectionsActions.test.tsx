/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useCollectionsActions } from './useCollectionsActions';

// Mock PageNavigate
const mockPageNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

// Mock the dependent hooks
vi.mock('./useDeleteCollections', () => ({
  useDeleteCollections: () => vi.fn(),
}));

vi.mock('./useDeprecateOrUndeprecateCollections', () => ({
  useDeprecateOrUndeprecateCollections: () => vi.fn(),
}));

vi.mock('./useSignCollection', () => ({
  useSignCollection: () => ({ signCollection: vi.fn(), canSign: true }),
}));

// Mock HubRoute enum
vi.mock('../../main/HubRoutes', () => ({
  HubRoute: {
    UploadCollection: 'UploadCollection',
  },
}));

function renderUseCollectionsActions(namespace?: string) {
  const callback = vi.fn();
  return renderHook(() => useCollectionsActions(callback, namespace), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useCollectionsActions', () => {
  beforeEach(() => {
    mockPageNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of actions', () => {
    const { result } = renderUseCollectionsActions();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Upload collection action', () => {
    const { result } = renderUseCollectionsActions();
    const uploadAction = result.current.find(
      (action) => 'label' in action && action.label === 'Upload collection'
    );
    expect(uploadAction).toBeDefined();
  });

  describe('Upload collection action', () => {
    it('should navigate to upload page without query when no namespace provided', () => {
      const { result } = renderUseCollectionsActions();
      const uploadAction = result.current.find(
        (action) => 'label' in action && action.label === 'Upload collection'
      );

      expect(uploadAction).toBeDefined();
      if (uploadAction && 'onClick' in uploadAction && typeof uploadAction.onClick === 'function') {
        // PageActionSelection.None actions have onClick with no required arguments
        (uploadAction.onClick as () => void)();
        expect(mockPageNavigate).toHaveBeenCalledWith('UploadCollection', undefined);
      }
    });

    it('should navigate to upload page with namespace query when namespace provided', () => {
      const { result } = renderUseCollectionsActions('my-namespace');
      const uploadAction = result.current.find(
        (action) => 'label' in action && action.label === 'Upload collection'
      );

      expect(uploadAction).toBeDefined();
      if (uploadAction && 'onClick' in uploadAction && typeof uploadAction.onClick === 'function') {
        // PageActionSelection.None actions have onClick with no required arguments
        (uploadAction.onClick as () => void)();
        expect(mockPageNavigate).toHaveBeenCalledWith('UploadCollection', {
          query: { namespace: 'my-namespace' },
        });
      }
    });
  });

  it('should include deprecate/undeprecate action', () => {
    const { result } = renderUseCollectionsActions();
    const deprecateAction = result.current.find(
      (action) => 'label' in action && action.label === 'Deprecate collections'
    );
    expect(deprecateAction).toBeDefined();
  });

  it('should include sign action when signing is enabled', () => {
    const { result } = renderUseCollectionsActions();
    const signAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sign collections'
    );
    expect(signAction).toBeDefined();
  });

  it('should include delete action', () => {
    const { result } = renderUseCollectionsActions();
    const deleteAction = result.current.find(
      (action) => 'label' in action && action.label === 'Delete collections'
    );
    expect(deleteAction).toBeDefined();
  });
});
