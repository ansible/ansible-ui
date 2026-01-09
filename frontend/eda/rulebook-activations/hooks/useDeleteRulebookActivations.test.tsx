/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { renderHook, act, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from 'vitest';
import {
  useDeleteRulebookActivations,
  useDeleteRulebookActivationsWithWarning,
} from './useDeleteRulebookActivations';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '../../common/eda-utils';
import { BrowserRouter } from 'react-router-dom';
import { StatusEnum } from '../../interfaces/generated/eda-api';

vi.mock('./useRulebookActivationColumns', () => ({
  useRulebookActivationColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaRulebookActivation) => item.name,
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

const server = setupServer();

describe('useDeleteRulebookActivations hooks', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const onComplete = vi.fn();
  const activations: EdaRulebookActivation[] = [
    { id: 1, name: 'Activation 1', is_enabled: true } as EdaRulebookActivation,
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('useDeleteRulebookActivations should open bulk action dialog', () => {
    const { result } = renderHook(() => useDeleteRulebookActivations(onComplete), { wrapper });
    act(() => {
      result.current(activations);
    });

    expect(screen.getByText('Permanently delete rulebook activations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete rulebook activations' })).toBeInTheDocument();
    expect(
      screen.getByText('Yes, I confirm that I want to delete these 1 rulebook activations.')
    ).toBeInTheDocument();
  });

  it('useDeleteRulebookActivations should call actionFn on confirm', async () => {
    server.use(
      http.delete(edaAPI`/activations/1/`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteRulebookActivations(onComplete), { wrapper });
    act(() => {
      result.current(activations);
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByRole('button', { name: 'Delete rulebook activations' });
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('useDeleteRulebookActivationsWithWarning should open bulk action dialog', () => {
    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(activations);
    });

    expect(screen.getByText('Permanently delete rulebook activations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete rulebook activations' })).toBeInTheDocument();
    expect(
      screen.getByText('Yes, I confirm that I want to delete these 1 rulebook activations.')
    ).toBeInTheDocument();
  });

  it('useDeleteRulebookActivationsWithWarning should call actionFn on confirm', async () => {
    server.use(
      http.delete(edaAPI`/activations/1/`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(activations);
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByRole('button', { name: 'Delete rulebook activations' });
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('useDeleteRulebookActivationsWithWarning should show single message when one activation has workers offline', () => {
    const offlineActivation: EdaRulebookActivation[] = [
      { id: 1, name: 'Activation 1', status: StatusEnum.WorkersOffline } as EdaRulebookActivation,
    ];
    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(offlineActivation);
    });

    expect(
      screen.getByText(
        'Activation 1 activation has workers offline. Deleting it might orphan pods and leave the existing activation running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activation is no longer running.'
      )
    ).toBeInTheDocument();
  });

  it('useDeleteRulebookActivationsWithWarning should show multi message when multiple activations have workers offline', () => {
    const offlineActivations: EdaRulebookActivation[] = [
      { id: 1, name: 'Activation 1', status: StatusEnum.WorkersOffline } as EdaRulebookActivation,
      { id: 2, name: 'Activation 2', status: StatusEnum.WorkersOffline } as EdaRulebookActivation,
    ];
    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(offlineActivations);
    });

    expect(
      screen.getByText(
        'Activation 1, Activation 2 activations have workers offline. Deleting them might orphan pods and leave the existing activations running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activations are no longer running.'
      )
    ).toBeInTheDocument();
  });

  it('useDeleteRulebookActivationsWithWarning should only name workers offline activations in warning when mixed with running activations', () => {
    const mixedActivations: EdaRulebookActivation[] = [
      {
        id: 1,
        name: 'Offline Activation',
        status: StatusEnum.WorkersOffline,
      } as EdaRulebookActivation,
      { id: 2, name: 'Running Activation', status: StatusEnum.Running } as EdaRulebookActivation,
      { id: 3, name: 'Another Running', status: StatusEnum.Running } as EdaRulebookActivation,
    ];
    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(mixedActivations);
    });

    // Warning message should only mention the offline activation
    expect(
      screen.getByText(
        'Offline Activation activation has workers offline. Deleting it might orphan pods and leave the existing activation running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activation is no longer running.'
      )
    ).toBeInTheDocument();

    // But all 3 activations should be listed in the confirmation table
    expect(screen.getByText('Offline Activation')).toBeInTheDocument();
    expect(screen.getByText('Running Activation')).toBeInTheDocument();
    expect(screen.getByText('Another Running')).toBeInTheDocument();
  });

  it('useDeleteRulebookActivationsWithWarning should show multi message for multiple offline activations when mixed with running', () => {
    const mixedActivations: EdaRulebookActivation[] = [
      { id: 1, name: 'Offline One', status: StatusEnum.WorkersOffline } as EdaRulebookActivation,
      { id: 2, name: 'Offline Two', status: StatusEnum.WorkersOffline } as EdaRulebookActivation,
      { id: 3, name: 'Running One', status: StatusEnum.Running } as EdaRulebookActivation,
    ];
    const { result } = renderHook(() => useDeleteRulebookActivationsWithWarning(onComplete), {
      wrapper,
    });
    act(() => {
      result.current(mixedActivations);
    });

    // Warning message should only mention the offline activations (plural message)
    expect(
      screen.getByText(
        'Offline One, Offline Two activations have workers offline. Deleting them might orphan pods and leave the existing activations running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activations are no longer running.'
      )
    ).toBeInTheDocument();

    // All 3 activations should be listed in the confirmation table
    expect(screen.getByText('Offline One')).toBeInTheDocument();
    expect(screen.getByText('Offline Two')).toBeInTheDocument();
    expect(screen.getByText('Running One')).toBeInTheDocument();
  });
});
