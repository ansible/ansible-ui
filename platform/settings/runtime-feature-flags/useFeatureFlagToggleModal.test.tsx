/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IFeatureFlag, SupportLevel, ToggleType } from './IFeatureFlag';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockBulkConfirmation = vi.fn();

vi.mock('@ansible/ansible-ui-framework', () => ({
  useBulkConfirmation: () => mockBulkConfirmation,
  TextCell: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      if (opts) {
        return Object.entries(opts).reduce((str, [k, v]) => str.replace(`{{${k}}}`, v), key);
      }
      return key;
    },
  }),
}));

function createFlag(overrides: Partial<IFeatureFlag> = {}): IFeatureFlag {
  return {
    id: 3,
    url: '/api/gateway/v1/feature_flags/3/',
    related: {
      activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=3',
      created_by: '/api/gateway/v1/users/1/',
      modified_by: '/api/gateway/v1/users/1/',
    },
    summary_fields: {
      modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      resource: { ansible_id: 'test-id', resource_type: 'shared.aapflag' },
    },
    created: '2026-03-09T09:10:01.782315Z',
    created_by: 1,
    modified: '2026-03-09T09:10:01.782295Z',
    modified_by: 1,
    name: 'FEATURE_TEST',
    ui_name: 'Test Feature',
    condition: 'boolean',
    value: 'False',
    required: false,
    support_level: 'TECHNOLOGY_PREVIEW' as SupportLevel,
    visibility: true,
    toggle_type: 'run-time' as ToggleType,
    description: 'A test feature flag.',
    support_url: 'https://access.redhat.com/articles/test',
    labels: ['controller'],
    state: false,
    ...overrides,
  };
}

async function renderAndClickModal(options: {
  flag?: IFeatureFlag;
  enable: boolean;
  onComplete?: () => void;
}) {
  const { useFeatureFlagToggleModal } = await import('./useFeatureFlagToggleModal');
  const flag = options.flag ?? createFlag();
  const onComplete = options.onComplete ?? vi.fn();

  function TestComponent() {
    const openModal = useFeatureFlagToggleModal();
    return (
      <button onClick={() => openModal({ flag, enable: options.enable, onComplete })}>
        Open Modal
      </button>
    );
  }

  const user = userEvent.setup();
  render(<TestComponent />);
  await user.click(screen.getByText('Open Modal'));
}

describe('useFeatureFlagToggleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call bulkConfirmation with enable title and prompt', async () => {
    await renderAndClickModal({ enable: true });

    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Enable technology preview feature flag?',
        actionButtonText: 'Enable feature flag',
        items: [expect.objectContaining({ id: 3, ui_name: 'Test Feature' })],
      })
    );
  });

  it('should call bulkConfirmation with disable title and prompt', async () => {
    await renderAndClickModal({ flag: createFlag({ state: true }), enable: false });

    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Disable feature flag?',
        actionButtonText: 'Disable feature flag',
      })
    );
  });

  it('should pass the flag as a single-item array', async () => {
    const flag = createFlag({ id: 5, ui_name: 'Indirect Node Counting' });
    await renderAndClickModal({ flag, enable: true });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.items).toHaveLength(1);
    expect(call.items[0].ui_name).toBe('Indirect Node Counting');
    expect(call.keyFn(flag)).toBe(5);
  });

  it('should send PATCH with value True when enabling', async () => {
    let patchBody: Record<string, unknown> | undefined;
    server.use(
      http.patch('/api/gateway/v1/feature_flags/3/', async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({});
      })
    );

    await renderAndClickModal({ flag: createFlag({ id: 3 }), enable: true });

    const call = mockBulkConfirmation.mock.calls[0][0];
    await call.actionFn(createFlag({ id: 3 }), new AbortController().signal);

    expect(patchBody).toEqual({ value: 'True' });
  });

  it('should send PATCH with value False when disabling', async () => {
    let patchBody: Record<string, unknown> | undefined;
    server.use(
      http.patch('/api/gateway/v1/feature_flags/3/', async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({});
      })
    );

    await renderAndClickModal({ flag: createFlag({ id: 3, state: true }), enable: false });

    const call = mockBulkConfirmation.mock.calls[0][0];
    await call.actionFn(createFlag({ id: 3 }), new AbortController().signal);

    expect(patchBody).toEqual({ value: 'False' });
  });

  it('should pass correct confirmText and prompt for enabling tech preview', async () => {
    await renderAndClickModal({ enable: true });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.confirmText).toBe('Yes, I confirm that I want to enable this feature flag.');

    const { container } = render(call.prompt);
    expect(container.textContent).toContain('Are you sure you want to enable this feature flag?');
    expect(container.textContent).toContain('technology preview');
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://access.redhat.com/support/offerings/techpreview');
    expect(link).toHaveTextContent("Red Hat's Technology Preview statement");
  });

  it('should pass correct confirmText and prompt for disabling tech preview', async () => {
    await renderAndClickModal({ flag: createFlag({ state: true }), enable: false });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.confirmText).toBe('Yes, I confirm that I want to disable this feature flag.');

    const { container } = render(call.prompt);
    expect(container.textContent).toContain(
      'Are you sure you want to disable the feature flag below?'
    );
    expect(container.textContent).not.toContain('technology preview');
    expect(container.querySelector('a')).toBeNull();
  });

  it('should pass correct title and prompt for enabling dev preview', async () => {
    await renderAndClickModal({
      flag: createFlag({ support_level: 'DEVELOPER_PREVIEW' }),
      enable: true,
    });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.title).toBe('Enable developer preview feature flag?');
    expect(call.actionButtonText).toBe('Enable feature flag');

    const { container } = render(call.prompt);
    expect(container.textContent).toContain('Are you sure you want to enable this feature flag?');
    expect(container.textContent).toContain('developer preview');
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://access.redhat.com/support/offerings/devpreview');
    expect(link).toHaveTextContent("Red Hat's Developer Preview statement");
  });

  it('should pass correct title and prompt for disabling dev preview', async () => {
    await renderAndClickModal({
      flag: createFlag({ support_level: 'DEVELOPER_PREVIEW', state: true }),
      enable: false,
    });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.title).toBe('Disable feature flag?');

    const { container } = render(call.prompt);
    expect(container.textContent).toContain(
      'Are you sure you want to disable the feature flag below?'
    );
    expect(container.textContent).not.toContain('developer preview');
    expect(container.querySelector('a')).toBeNull();
  });

  it('should pass onComplete callback to bulkConfirmation', async () => {
    const onComplete = vi.fn();
    await renderAndClickModal({ enable: true, onComplete });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.onComplete).toBe(onComplete);
  });

  it('should propagate API error from PATCH', async () => {
    server.use(
      http.patch('/api/gateway/v1/feature_flags/3/', () =>
        HttpResponse.json({ detail: 'Permission denied' }, { status: 403 })
      )
    );

    await renderAndClickModal({ flag: createFlag({ id: 3 }), enable: true });

    const call = mockBulkConfirmation.mock.calls[0][0];
    await expect(
      call.actionFn(createFlag({ id: 3 }), new AbortController().signal)
    ).rejects.toThrow();
  });

  it('should include confirmation and action columns', async () => {
    await renderAndClickModal({ enable: true });

    const call = mockBulkConfirmation.mock.calls[0][0];
    expect(call.confirmationColumns).toHaveLength(2);
    expect(call.confirmationColumns[0].header).toBe('Name');
    expect(call.confirmationColumns[1].header).toBe('Support level');
    expect(call.actionColumns).toHaveLength(1);
    expect(call.actionColumns[0].header).toBe('Name');
  });
});
