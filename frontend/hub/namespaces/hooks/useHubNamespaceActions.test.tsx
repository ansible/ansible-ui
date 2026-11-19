import { renderHook } from '@testing-library/react';
import { PageActionType } from '@ansible/ansible-ui-framework';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespaceActions } from './useHubNamespaceActions';

const pageNavigate = vi.hoisted(() => vi.fn());
const deleteNamespaces = vi.hoisted(() => vi.fn());
const signAll = vi.hoisted(() => vi.fn());
const captured = vi.hoisted(() => ({
  onDeleted: undefined as ((namespaces: HubNamespace[]) => void) | undefined,
}));
const insights = vi.hoisted(() => ({ value: false }));
const hub = vi.hoisted(() => ({
  hasPermission: vi.fn((_permission: string) => false),
  user: null as { is_superuser?: boolean } | null,
  canUploadSignatures: false,
  canCreateSignatures: true,
  signingService: 'auto-sign' as string | undefined,
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../../common/isInsights', () => ({
  isInsightsMode: () => insights.value,
}));

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    settings: { GALAXY_COLLECTION_SIGNING_SERVICE: hub.signingService },
    featureFlags: {
      can_upload_signatures: hub.canUploadSignatures,
      can_create_signatures: hub.canCreateSignatures,
    },
    hasPermission: (permission: string) => hub.hasPermission(permission),
    user: hub.user,
  }),
}));

vi.mock('./useDeleteHubNamespaces', () => ({
  useDeleteHubNamespaces: (onComplete: (namespaces: HubNamespace[]) => void) => {
    captured.onDeleted = onComplete;
    return deleteNamespaces;
  },
}));

vi.mock('../../collections/hooks/useSignAllCollections', () => ({
  useSignAllCollections: () => signAll,
}));

const namespace = {
  name: 'demo',
  id: 1,
  pulp_href: '/pulp/namespaces/1/',
  related_fields: { my_permissions: [] as string[] },
} as HubNamespace;

function renderActions(
  options?: Parameters<typeof useHubNamespaceActions>[0],
  search = '/namespaces?repository=published'
) {
  window.history.pushState({}, '', search);
  return renderHook(() => useHubNamespaceActions(options), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

type NamespaceButton = {
  onClick: (item: HubNamespace) => void;
  isHidden?: (item: HubNamespace) => boolean;
  isDisabled?: (item: HubNamespace) => string;
};

function buttonAction(
  actions: ReturnType<typeof useHubNamespaceActions>,
  label: string
): NamespaceButton {
  const action = actions.find((item) => 'label' in item && item.label === label);
  if (!action || action.type !== PageActionType.Button) {
    throw new Error(`Missing button action ${label}`);
  }
  return action as NamespaceButton;
}

describe('useHubNamespaceActions', () => {
  beforeEach(() => {
    pageNavigate.mockClear();
    deleteNamespaces.mockClear();
    signAll.mockClear();
    insights.value = false;
    vi.mocked(hub.hasPermission).mockReturnValue(false);
    hub.user = null;
    hub.canUploadSignatures = false;
    hub.canCreateSignatures = true;
    hub.signingService = 'auto-sign';
    captured.onDeleted = undefined;
  });

  it('navigates to edit and imports, and uses default callbacks when options are omitted', () => {
    const { result } = renderActions();

    buttonAction(result.current, 'Edit namespace').onClick(namespace);
    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.EditNamespace, {
      params: { id: 'demo' },
    });

    buttonAction(result.current, 'Imports').onClick(namespace);
    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.MyImports, {
      query: { namespace: 'demo', from: 'namespaces' },
    });

    expect(buttonAction(result.current, 'Sign all collections').isHidden?.(namespace)).toBe(true);
    captured.onDeleted?.([namespace]);
  });

  it('shows sign-all on the details page when a repository filter is selected', () => {
    const onSigned = vi.fn();
    const { result } = renderActions({
      onHubNamespacesDeleted: vi.fn(),
      onHubNamespacesSignAllCollections: onSigned,
      isDetailsPageAction: true,
    });

    const sign = buttonAction(result.current, 'Sign all collections');
    expect(sign.isHidden?.(namespace)).toBe(false);
    expect(sign.isDisabled?.(namespace)).toBe('');

    sign.onClick(namespace);
    expect(signAll).toHaveBeenCalledWith({
      onComplete: onSigned,
      namespace,
      signing_service: 'auto-sign',
    });
    onSigned(namespace);

    buttonAction(result.current, 'Imports').onClick(namespace);
    expect(pageNavigate).toHaveBeenCalledWith(HubRoute.MyImports, {
      query: { namespace: 'demo', from: 'namespace' },
    });
  });

  it('disables sign-all until a repository filter is selected and hides it when signing is unavailable', () => {
    const { result, rerender } = renderActions(
      { onHubNamespacesDeleted: vi.fn(), isDetailsPageAction: true },
      '/namespaces'
    );
    const sign = () => buttonAction(result.current, 'Sign all collections');

    expect(sign().isDisabled?.(namespace)).toBe('Select a repository filter');

    hub.canUploadSignatures = true;
    rerender();
    expect(sign().isHidden?.(namespace)).toBe(true);

    hub.canUploadSignatures = false;
    hub.canCreateSignatures = false;
    rerender();
    expect(sign().isHidden?.(namespace)).toBe(true);

    hub.canCreateSignatures = true;
    insights.value = true;
    rerender();
    expect(sign().isHidden?.(namespace)).toBe(true);
  });

  it('uses an empty signing service when settings do not define one', () => {
    hub.signingService = undefined;
    const { result } = renderActions({
      onHubNamespacesDeleted: vi.fn(),
      isDetailsPageAction: true,
    });

    buttonAction(result.current, 'Sign all collections').onClick(namespace);
    expect(signAll).toHaveBeenCalledWith(expect.objectContaining({ signing_service: '' }));
  });

  it('shows delete outside insights and hides it in insights without permission', () => {
    const onDeleted = vi.fn();
    const { result, rerender } = renderActions({ onHubNamespacesDeleted: onDeleted });
    const remove = () => buttonAction(result.current, 'Delete namespace');

    expect(remove().isHidden?.(namespace)).toBe(false);
    remove().onClick(namespace);
    expect(deleteNamespaces).toHaveBeenCalledWith([namespace]);
    captured.onDeleted?.([namespace]);
    expect(onDeleted).toHaveBeenCalledWith([namespace]);

    insights.value = true;
    rerender();
    expect(remove().isHidden?.(namespace)).toBe(true);
    expect(remove().isHidden?.({ ...namespace, related_fields: {} })).toBe(true);

    vi.mocked(hub.hasPermission).mockImplementation(
      (permission) => permission === 'galaxy.delete_namespace'
    );
    rerender();
    expect(remove().isHidden?.(namespace)).toBe(false);

    vi.mocked(hub.hasPermission).mockReturnValue(false);
    rerender();
    expect(
      remove().isHidden?.({
        ...namespace,
        related_fields: { my_permissions: ['galaxy.delete_namespace'] },
      })
    ).toBe(false);

    hub.user = { is_superuser: true };
    rerender();
    expect(remove().isHidden?.(namespace)).toBe(false);
  });
});
