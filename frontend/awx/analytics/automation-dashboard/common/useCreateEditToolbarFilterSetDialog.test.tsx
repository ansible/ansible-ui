/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import type { IDashboardFilterSet } from '../types';
import { useCreateEditToolbarFilterSetDialog } from './useCreateEditToolbarFilterSetDialog';

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const newFilterSet = {
  id: undefined,
  name: '',
  filters: '{"period":["last_30_days"]}',
  is_default: false,
} as IDashboardFilterSet & { id: undefined };

const existingFilterSet: IDashboardFilterSet = {
  id: 5,
  name: 'Existing Report',
  filters: '{"period":["last_7_days"]}',
  is_default: false,
};

const createdFilterSet: IDashboardFilterSet = {
  id: 42,
  name: 'New Report',
  filters: '{"period":["last_30_days"]}',
  is_default: false,
};

const filterState = { period: ['last_30_days'] };

// ─── Wrapper ──────────────────────────────────────────────────────────────────

// Mirrors the real PageFramework hierarchy:
//   PageDialogProvider > PageAlertToasterProvider > children
// The hook lives inside PageAlertToasterProvider, the dialog is rendered by
// PageDialogProvider (outside PageAlertToasterProvider — which is why the hook
// must own the alert call, not the dialog component).
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <PageDialogProvider>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </PageDialogProvider>
  );
}

// Component that calls the hook and exposes a button to open the dialog
function OpenDialogButton({
  filterSet,
  onComplete,
}: {
  filterSet: IDashboardFilterSet;
  onComplete: (fs: IDashboardFilterSet) => void;
}) {
  const openDialog = useCreateEditToolbarFilterSetDialog(onComplete);
  return <button onClick={() => openDialog(filterState, filterSet)}>Open dialog</button>;
}

/** Opens the dialog, fills the name field, and clicks the submit button. */
async function openAndSubmit(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await user.clear(screen.getByRole('textbox', { name: /name/i }));
  await user.type(screen.getByRole('textbox', { name: /name/i }), name);
  await user.click(screen.getByRole('button', { name: /create report|save changes/i }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCreateEditToolbarFilterSetDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dialog rendering', () => {
    test('should open the dialog when invoked for a new filter set', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Create new report' })).toBeInTheDocument();
    });

    test('should show "Edit report" title when editing an existing filter set', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={existingFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByText('Edit report')).toBeInTheDocument();
    });

    test('should communicate that both name and filter state will be saved when editing', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={existingFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(
        screen.getByText(
          'This will update the report with the current name and filter configuration.'
        )
      ).toBeInTheDocument();
    });

    test('should render the Name input', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    test('should close the dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('creating a new filter set (POST)', () => {
    test('should POST to the filter sets endpoint on submit', async () => {
      let capturedBody: unknown;
      server.use(
        http.post(metricsAPI`/dashboard_reports/filter_sets/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(createdFilterSet, { status: 201 });
        })
      );

      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await openAndSubmit(user, 'New Report');

      await waitFor(() => {
        expect(capturedBody).toMatchObject({ name: 'New Report' });
      });
    });

    test('should call onComplete with the created filter set', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(createdFilterSet, { status: 201 })
        )
      );

      const onComplete = vi.fn();
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={onComplete} />
        </Wrapper>
      );

      await openAndSubmit(user, 'New Report');

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(createdFilterSet);
      });
    });

    test('should close the dialog after successful submit', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(createdFilterSet, { status: 201 })
        )
      );

      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={newFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await openAndSubmit(user, 'New Report');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('editing an existing filter set (PUT)', () => {
    test('should PUT to the filter set endpoint on submit', async () => {
      let capturedBody: unknown;
      const id = existingFilterSet.id;
      server.use(
        http.put(metricsAPI`/dashboard_reports/filter_sets/${id}/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ ...existingFilterSet, name: 'Updated' });
        })
      );

      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={existingFilterSet} onComplete={vi.fn()} />
        </Wrapper>
      );

      await openAndSubmit(user, 'Updated');

      await waitFor(() => {
        expect(capturedBody).toMatchObject({ name: 'Updated' });
      });
    });

    test('should call onComplete after a successful PUT', async () => {
      const updated = { ...existingFilterSet, name: 'Updated' };
      const id = existingFilterSet.id;
      server.use(
        http.put(metricsAPI`/dashboard_reports/filter_sets/${id}/`, () =>
          HttpResponse.json(updated)
        )
      );

      const onComplete = vi.fn();
      const user = userEvent.setup();
      render(
        <Wrapper>
          <OpenDialogButton filterSet={existingFilterSet} onComplete={onComplete} />
        </Wrapper>
      );

      await openAndSubmit(user, 'Updated');

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated' }));
      });
    });
  });

  describe('hook return value', () => {
    test('should return a stable function reference when dependencies do not change', () => {
      const stableOnComplete = vi.fn();
      const { result, rerender } = renderHook(
        () => useCreateEditToolbarFilterSetDialog(stableOnComplete),
        { wrapper: Wrapper }
      );

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });
});
