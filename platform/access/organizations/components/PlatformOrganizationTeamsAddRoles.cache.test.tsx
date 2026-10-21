import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformOrganizationTeamsAddRoles } from './PlatformOrganizationTeamsAddRoles';

const { clearCacheByKeyMock, navigateMock, progressDialogMock, useGetMock } = vi.hoisted(() => ({
  clearCacheByKeyMock: vi.fn(),
  navigateMock: vi.fn(),
  progressDialogMock: vi.fn(),
  useGetMock: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageHeader: () => null,
    PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PageWizard: (props: { onSubmit: (data: unknown) => unknown }) => (
      <button
        onClick={() =>
          props.onSubmit({
            teams: [],
            awxRoles: [],
            edaRoles: [],
          })
        }
      >
        Submit
      </button>
    ),
    useGetPageUrl: () => () => '',
    usePageNavigate: () => navigateMock,
  };
});

vi.mock('@ansible/awx-ui/common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => progressDialogMock,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: useGetMock,
}));

vi.mock('@ansible/common-ui/useInvalidateCache/useInvalidateCache', () => ({
  useClearCache: () => ({ clearCacheByKey: clearCacheByKeyMock }),
}));

vi.mock('@ansible/eda-ui/interfaces/EdaRbacRole', () => ({}));

describe('PlatformOrganizationTeamsAddRoles cache invalidation', () => {
  beforeEach(() => {
    clearCacheByKeyMock.mockReset();
    navigateMock.mockReset();
    progressDialogMock.mockReset();
    useGetMock.mockReset();
    useGetMock.mockReturnValue({
      data: {
        id: 42,
        name: 'Test organization',
        summary_fields: { resource: { ansible_id: 'org-resource-id' } },
      },
      isLoading: false,
    });
  });

  it('clears role assignment cache before returning to the Teams tab', () => {
    render(<PlatformOrganizationTeamsAddRoles />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(progressDialogMock).toHaveBeenCalledTimes(1);

    const dialogOptions = progressDialogMock.mock.calls[0][0] as { onClose: () => void };
    dialogOptions.onClose();

    expect(clearCacheByKeyMock).toHaveBeenCalledWith(
      expect.stringContaining('/role_team_assignments/')
    );
    expect(navigateMock).toHaveBeenCalled();
  });
});
