/* eslint-disable i18next/no-literal-string */
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../../test/mockExecutionEnvironment';
import { useExecutionEnvironmentManageTags } from './useExecutionEnvironmentManageTags';

const { capturedDialog } = vi.hoisted(() => ({
  capturedDialog: { current: null as React.ReactNode },
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [
      undefined,
      (dialog: React.ReactNode) => {
        capturedDialog.current = dialog;
      },
    ],
  };
});

vi.mock('@patternfly/react-core', async () => {
  const actual = await vi.importActual('@patternfly/react-core');
  return {
    ...actual,
    Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalHeader: ({ title }: { title: string }) => <div>{title}</div>,
  };
});

const mockTagsResponse = {
  meta: { count: 1 },
  data: [{ name: 'latest', created_at: '2024-01-01T00:00:00Z' }],
  links: {},
};

describe('useExecutionEnvironmentManageTags', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    capturedDialog.current = null;
  });
  afterAll(() => server.close());

  function openManageTagsDialog(onComplete?: () => void) {
    const { result } = renderHook(() => useExecutionEnvironmentManageTags(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    act(() => {
      result.current(mockExecutionEnvironment, mockExecutionEnvironmentImage);
    });
    render(<MemoryRouter>{capturedDialog.current}</MemoryRouter>);
  }

  it('opens manage tags dialog and loads existing tags', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json(mockTagsResponse)
      )
    );

    openManageTagsDialog();

    await waitFor(() => {
      expect(screen.getByText('Manage tags')).toBeInTheDocument();
    });
    expect(screen.getByText('latest')).toBeInTheDocument();
    expect(screen.getByTestId('add-tag-input')).toBeInTheDocument();
  });

  it('validates invalid tag input on add', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), '.invalid');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText(/A tag may contain lowercase and uppercase/i)).toBeInTheDocument();
    });
  });

  it('adds a new tag when image lookup fails', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/tag/'),
        () => HttpResponse.json({ state: 'completed' })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), 'v1');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText(/Tag v1 successfully added/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete after successfully adding a tag', async () => {
    const onComplete = vi.fn();
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/tag/'),
        () => HttpResponse.json({ state: 'completed' })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog(onComplete);

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), 'v3');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('shows danger alert when tag task does not complete', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/tag/'),
        () => HttpResponse.json({ state: 'failed' })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), 'v2');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to add tag v2/i)).toBeInTheDocument();
    });
  });

  it('adds tag on Enter key in tag input', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/tag/'),
        () => HttpResponse.json({ state: 'completed' })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), 'enter-tag{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/Tag enter-tag successfully added/i)).toBeInTheDocument();
    });
  });

  it('does not add tag when image already exists for tag name', async () => {
    let tagPostCalled = false;
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.includes('/_content/tags/'),
        () => HttpResponse.json(mockExecutionEnvironmentImage)
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/tag/'),
        () => {
          tagPostCalled = true;
          return HttpResponse.json({ state: 'completed' });
        }
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    await screen.findByTestId('add-tag-input');
    await user.type(screen.getByTestId('add-tag-input'), 'latest');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(tagPostCalled).toBe(false);
    });
  });

  it('removes a tag from the image', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json(mockTagsResponse)
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/untag/'),
        () => HttpResponse.json({ state: 'completed' })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    const tagGroup = await screen.findByTestId('tag');
    const removeButton = within(tagGroup).getAllByRole('button')[0];
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText(/Tag latest successfully removed/i)).toBeInTheDocument();
    });
  });

  it('shows form error when remove tag request fails', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_content/tags/'),
        () => HttpResponse.json(mockTagsResponse)
      ),
      http.post(
        ({ request }) =>
          request.url.includes('/repositories/container/container-push/') &&
          request.url.endsWith('/untag/'),
        () => HttpResponse.json({ detail: 'Cannot remove tag' }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    openManageTagsDialog();

    const tagGroup = await screen.findByTestId('tag');
    await user.click(within(tagGroup).getAllByRole('button')[0]);

    await waitFor(() => {
      expect(screen.getByText(/Cannot remove tag|Error while removing tag/i)).toBeInTheDocument();
    });
  });
});
