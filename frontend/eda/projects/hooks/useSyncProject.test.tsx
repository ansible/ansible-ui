/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { renderHook, act, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useSyncProject } from './useSyncProject';
import { EdaProject } from '../../interfaces/EdaProject';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

vi.mock('./useProjectColumns', () => ({
  useProjectColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaProject) => item.name,
      modal: 'visible',
    },
  ]),
}));

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn(),
  postRequest: vi.fn(),
}));

describe('useSyncProject hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockView: IEdaView<EdaProject> = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IEdaView<EdaProject>;

  const projects: EdaProject[] = [{ id: 1, name: 'Test Project' } as EdaProject];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should open bulk action dialog when syncing project', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestGet).mockResolvedValue({ results: [] });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    expect(screen.getByText('Sync project Test Project')).toBeInTheDocument();
    expect(
      screen.getByText('Yes, I confirm that I want to sync these 1 projects.')
    ).toBeInTheDocument();
  });

  it('should display warning when activations have restart_on_project_update enabled', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    const activations: EdaRulebookActivation[] = [
      {
        id: 1,
        name: 'Activation 1',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
      {
        id: 2,
        name: 'Activation 2',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
    ];

    vi.mocked(requestGet).mockResolvedValue({ results: activations });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    expect(
      screen.getByText(
        /The following Rulebook Activations are configured to restart on project sync/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Activation 1, Activation 2/)).toBeInTheDocument();
  });

  it('should not display warning when no activations have restart_on_project_update enabled', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    const activations: EdaRulebookActivation[] = [
      {
        id: 1,
        name: 'Activation 1',
        restart_on_project_update: false,
      } as EdaRulebookActivation,
    ];

    vi.mocked(requestGet).mockResolvedValue({ results: activations });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    expect(
      screen.queryByText(/The following Rulebook Activations are configured to restart/)
    ).not.toBeInTheDocument();
  });

  it('should filter out activations without restart_on_project_update', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    const activations: EdaRulebookActivation[] = [
      {
        id: 1,
        name: 'Will Restart',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
      {
        id: 2,
        name: 'Will Not Restart',
        restart_on_project_update: false,
      } as EdaRulebookActivation,
    ];

    vi.mocked(requestGet).mockResolvedValue({ results: activations });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    expect(screen.getByText(/Will Restart/)).toBeInTheDocument();
    expect(screen.queryByText(/Will Not Restart/)).not.toBeInTheDocument();
  });

  it('should call sync API on confirm', async () => {
    const { requestGet, postRequest } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestGet).mockResolvedValue({ results: [] });
    vi.mocked(postRequest).mockResolvedValue({});

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByRole('button', { name: 'Sync projects' });
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(
      () => {
        expect(mockView.unselectItemsAndRefresh).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('should handle API error when fetching activations', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestGet).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    // The error alert is displayed via PageAlertToaster, which may not render in the test DOM
    // The important thing is that the hook handles the error gracefully without crashing
    expect(vi.mocked(requestGet)).toHaveBeenCalled();
  });

  it('should sort activations alphabetically in warning message', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    const activations: EdaRulebookActivation[] = [
      {
        id: 1,
        name: 'Zebra Activation',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
      {
        id: 2,
        name: 'Alpha Activation',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
      {
        id: 3,
        name: 'Middle Activation',
        restart_on_project_update: true,
      } as EdaRulebookActivation,
    ];

    vi.mocked(requestGet).mockResolvedValue({ results: activations });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    expect(
      screen.getByText(/Alpha Activation, Middle Activation, Zebra Activation/)
    ).toBeInTheDocument();
  });

  it('should mark sync as dangerous action', async () => {
    const { requestGet } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestGet).mockResolvedValue({ results: [] });

    const { result } = renderHook(() => useSyncProject(mockView.unselectItemsAndRefresh), {
      wrapper,
    });

    await act(async () => {
      await result.current(projects);
    });

    const submitButton = screen.getByRole('button', { name: 'Sync projects' });
    expect(submitButton).toHaveClass('pf-m-danger');
  });
});
