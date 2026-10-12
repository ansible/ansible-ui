/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setHubApiPath } from '../../common/api/formatPath';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { SignAllCollectionsModal, useSignAllCollections } from './useSignAllCollections';

const namespace: HubNamespace = {
  id: 1,
  name: 'demo',
  pulp_href: '/namespaces/demo/',
  company: '',
  description: '',
  email: '',
  avatar_url: '',
  groups: [],
  links: [],
  related_fields: {},
  resources: '',
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [undefined, vi.fn()],
  };
});

vi.mock('@ansible/ansible-ui-framework/components/useURLSearchParams', () => ({
  useURLSearchParams: () => [
    { get: (key: string) => (key === 'repository' ? 'published' : null) },
    vi.fn(),
  ],
}));

describe('useSignAllCollections', () => {
  const server = setupServer(
    http.get('*/pulp/api/v3/repositories/ansible/ansible/', () =>
      HttpResponse.json({
        results: [{ name: 'published', pulp_href: '/repositories/1/' }],
      })
    ),
    http.get('*/pulp/api/v3/distributions/ansible/ansible/', () =>
      HttpResponse.json({
        results: [{ base_path: 'published', repository: '/repositories/1/' }],
      })
    ),
    http.post('*/_ui/v1/collection_signing/', () =>
      HttpResponse.json({ ok: true }, { status: 201 })
    )
  );

  beforeAll(() => {
    setHubApiPath('/api/galaxy');
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('SignAllCollectionsModal submits signing request', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <SignAllCollectionsModal
        namespace={namespace}
        signing_service="ansible-default"
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('Sign all collections')).toBeInTheDocument();
    await user.click(screen.getByTestId('modal-sign-button'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(namespace);
    });
  });

  it('useSignAllCollections returns dialog opener', () => {
    const { result } = renderHook(() => useSignAllCollections());
    expect(typeof result.current).toBe('function');
  });
});
