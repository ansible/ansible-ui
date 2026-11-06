import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import type { IUserInput } from './PlatformUserForm';

const {
  mockPostUserRequest,
  mockPostRequest,
  mockPageNavigate,
  mockNavigate,
  mockAlertToaster,
  mockAwxErrorAdapter,
} = vi.hoisted(() => ({
  mockPostUserRequest: vi.fn<(url: string, user: Partial<PlatformUser>) => Promise<PlatformUser>>(),
  mockPostRequest: vi.fn(() => Promise.resolve({})),
  mockPageNavigate: vi.fn(),
  mockNavigate: vi.fn(),
  mockAlertToaster: { addAlert: vi.fn() },
  mockAwxErrorAdapter: vi.fn(() => ({ genericErrors: [], fieldErrors: [] })),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
    usePageNavigate: () => mockPageNavigate,
    usePageAlertToaster: () => mockAlertToaster,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: () => mockPostUserRequest,
}));
vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    postRequest: mockPostRequest,
  };
});
vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGet: (_url: string | undefined, qs?: { name?: string }) => {
      if (qs?.name === 'Platform Auditor') {
        return { data: { results: [{ id: 500 }] }, isLoading: false };
      }
      if (qs?.name === 'Organization Member') {
        return { data: { results: [{ id: 600 }] }, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    },
  };
});
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: {} } }),
}));

vi.mock('@ansible/awx-ui/common/adapters/awxErrorAdapter', () => ({
  awxErrorAdapter: (err: unknown) => mockAwxErrorAdapter(err),
}));

vi.mock('../../../common/PlatformPageForm', () => ({
  PlatformPageForm: (props: {
    onSubmit: (
      values: IUserInput,
      setError: (name: string, err: unknown) => void,
      setFieldError: (name: string, err: { message: string }) => void
    ) => Promise<boolean | void>;
    onCancel?: () => void;
  }) => (
    <div>
      <button
        type="button"
        data-testid="submit-mismatch"
        onClick={() => {
          const setFieldError = vi.fn();
          void props
            .onSubmit(
              {
                username: 'new',
                password: 'a',
                confirmPassword: 'b',
                organizations: [],
                userType: 'normal',
              } as IUserInput,
              vi.fn(),
              setFieldError
            )
            .then(() => {
              expect(setFieldError).toHaveBeenCalledWith(
                'confirmPassword',
                expect.objectContaining({ message: 'Password does not match.' })
              );
            });
        }}
      >
        mismatch
      </button>
      <button
        type="button"
        data-testid="submit-auditor"
        onClick={() =>
          void props.onSubmit(
            {
              username: 'new',
              password: 'secret',
              confirmPassword: 'secret',
              organizations: [],
              userType: 'auditor',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        auditor
      </button>
      <button
        type="button"
        data-testid="submit-org-fail"
        onClick={() =>
          void props.onSubmit(
            {
              username: 'new',
              password: 'secret',
              confirmPassword: 'secret',
              organizations: [9],
              userType: 'normal',
            } as IUserInput,
            vi.fn(),
            vi.fn()
          )
        }
      >
        org-fail
      </button>
      <button type="button" data-testid="run-cancel" onClick={() => props.onCancel?.()}>
        cancel
      </button>
    </div>
  ),
}));

import { CreatePlatformUser } from './PlatformUserForm';

describe('CreatePlatformUser submit branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPostUserRequest.mockResolvedValue({ id: 44, username: 'new' } as PlatformUser);
    mockPostRequest.mockResolvedValue({});
    mockAwxErrorAdapter.mockReturnValue({
      genericErrors: [{ message: 'generic-msg' }],
      fieldErrors: [{ message: 'field-msg' }],
    });
  });

  it('sets confirm password error when passwords differ', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreatePlatformUser />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('submit-mismatch'));
    expect(mockPostUserRequest).not.toHaveBeenCalled();
  });

  it('creates auditor user and posts platform auditor assignment', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreatePlatformUser />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('submit-auditor'));

    expect(mockPostRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      user: 44,
      role_definition: 500,
      object_id: null,
    });
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.UserDetails, {
      params: { id: 44 },
    });
  });

  it('shows toaster when organization association fails', async () => {
    const user = userEvent.setup();
    mockPostRequest.mockImplementation(() =>
      Promise.reject(Object.assign(new Error('x'), { response: { data: {} } }))
    );

    render(
      <MemoryRouter>
        <CreatePlatformUser />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('submit-org-fail'));

    expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to associate organization with id: 9.',
      })
    );
    const alertArg = mockAlertToaster.addAlert.mock.calls[0][0] as { children: ReactNode };
    expect(alertArg.children).toBeTruthy();
  });

  it('navigates back on cancel', async () => {
    const user = userEvent.setup();
    mockNavigate.mockReset();

    render(
      <MemoryRouter>
        <CreatePlatformUser />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('run-cancel'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
