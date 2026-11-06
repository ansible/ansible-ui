import { renderHook } from '@testing-library/react';
import {
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const mockPageNavigate = vi.fn();
const mockDeleteApplications = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: vi.fn(),
}));

vi.mock('./useDeleteOAuthApplications', () => ({
  useDeleteOAuthApplications: () => mockDeleteApplications,
}));

import { useOAuthApplicationActions } from './useOAuthApplicationActions';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';

const mockApp: Application = {
  id: 12,
  name: 'OAuth App',
  url: '/applications/12/',
  client_type: 'confidential',
  organization: 1,
  type: 'o_auth2_application',
  created: '',
  modified: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
    organization: { id: 1, name: 'Org', description: '' },
  },
};

function findButton(
  actions: ReturnType<typeof useOAuthApplicationActions>,
  label: string
): IPageActionButtonSingle<Application> | undefined {
  return actions.find(
    (a): a is IPageActionButtonSingle<Application> =>
      a.type === PageActionType.Button &&
      a.selection === PageActionSelection.Single &&
      a.label === label
  );
}

describe('useOAuthApplicationActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlatformActiveUser).mockReturnValue({
      activePlatformUser: { is_superuser: true },
    } as ReturnType<typeof usePlatformActiveUser>);
  });

  test('edit navigates and delete invokes bulk handler', () => {
    const { result } = renderHook(() =>
      useOAuthApplicationActions({ onApplicationsDeleted: vi.fn() })
    );

    const edit = findButton(result.current, 'Edit OAuth application');
    edit?.onClick?.(mockApp);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditApplication, {
      params: { id: mockApp.id },
    });

    const del = findButton(result.current, 'Delete OAuth application');
    del?.onClick?.(mockApp);
    expect(mockDeleteApplications).toHaveBeenCalledWith([mockApp]);
  });

  test('delete onClick no-ops when application is undefined', () => {
    const { result } = renderHook(() =>
      useOAuthApplicationActions({ onApplicationsDeleted: vi.fn() })
    );

    const del = findButton(result.current, 'Delete OAuth application');
    del?.onClick?.(undefined as unknown as Application);
    expect(mockDeleteApplications).not.toHaveBeenCalled();
  });
});
