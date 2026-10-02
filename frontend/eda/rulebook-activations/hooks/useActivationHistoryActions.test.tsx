/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useRulebookActivationsActions } from './useActivationHistoryActions';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';
import {
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '../../common/eda-utils';

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

const mockNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

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

const server = setupServer();

describe('useRulebookActivationsActions', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockRefresh = vi.fn().mockResolvedValue(undefined);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should return an array of actions', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockRefresh), { wrapper });
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBe(2);
  });

  it('should include a create activation action', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockRefresh), { wrapper });
    const createAction = result.current.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.None
    );
    expect(createAction).toBeDefined();
    expect(createAction?.type).toBe(PageActionType.Button);
  });

  it('should navigate on create action click', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockRefresh), { wrapper });
    const createAction = result.current.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.None
    ) as unknown as IPageActionButtonSingle<EdaRulebookActivation>;

    act(() => {
      createAction.onClick(undefined as unknown as EdaRulebookActivation);
    });
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should include a delete selected activations action', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockRefresh), { wrapper });
    const deleteAction = result.current.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.Multiple
    );
    expect(deleteAction).toBeDefined();
    expect(deleteAction?.type).toBe(PageActionType.Button);
  });

  it('should open delete dialog when delete action is triggered', () => {
    server.use(
      http.delete(edaAPI`/activations/1/`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useRulebookActivationsActions(mockRefresh), { wrapper });
    const deleteAction = result.current.find(
      (action) =>
        'selection' in action &&
        action.selection === PageActionSelection.Multiple &&
        'label' in action
    ) as unknown as IPageActionButtonSingle<EdaRulebookActivation>;

    const activations = [{ id: 1, name: 'Test Activation' } as EdaRulebookActivation];

    act(() => {
      (deleteAction.onClick as unknown as (items: EdaRulebookActivation[]) => void)(activations);
    });

    expect(screen.getByText('Permanently delete rulebook activations')).toBeInTheDocument();
  });
});
