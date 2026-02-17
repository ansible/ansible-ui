/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CreateHubNamespace, EditHubNamespace } from './HubNamespaceForm';

// Mock PageFormMarkdown due to monaco editor issues in tests
vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMarkdown', () => ({
  PageFormMarkdown: ({ label }: { label: string }) => (
    <div data-testid="page-form-markdown">{label}</div>
  ),
}));

vi.mock('./UsefulLinksFields', () => ({
  UsefulLinksFields: () => <div data-testid="useful-links-fields">Useful Links</div>,
}));

vi.mock('./components/HubNamespaceErrorAdapter', () => ({
  HubNamespaceErrorAdapter: () => null,
}));

describe('CreateHubNamespace', () => {
  const server = setupServer(
    http.post('*/_ui/v1/namespaces/', () =>
      HttpResponse.json({
        name: 'created-namespace',
        description: 'A new namespace',
        links: [],
      })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the create namespace page header', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Create namespace/i })).toBeInTheDocument();
  });

  it('should render the namespace name input field', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    // PageFormTextInput renders a label "Name"
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render the description field', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render the company field', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('should render useful links fields', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    expect(screen.getByTestId('useful-links-fields')).toBeInTheDocument();
  });

  it('should render the Resources markdown editor', () => {
    render(
      <MemoryRouter>
        <CreateHubNamespace />
      </MemoryRouter>
    );

    expect(screen.getByTestId('page-form-markdown')).toBeInTheDocument();
  });
});

describe('EditHubNamespace', () => {
  const server = setupServer(
    http.get('*/_ui/v1/my-namespaces/existing-namespace/', () =>
      HttpResponse.json({
        name: 'existing-namespace',
        description: 'An existing namespace',
        company: 'Test Corp',
        avatar_url: '',
        links: [{ name: 'website', url: 'https://example.com' }],
        resources: '',
      })
    ),
    http.put('*/_ui/v1/my-namespaces/existing-namespace/', () =>
      HttpResponse.json({
        name: 'existing-namespace',
        description: 'Updated description',
        links: [],
      })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the edit namespace page with data', async () => {
    render(
      <MemoryRouter initialEntries={['/namespaces/existing-namespace/edit']}>
        <Routes>
          <Route path="/namespaces/:id/edit" element={<EditHubNamespace />} />
        </Routes>
      </MemoryRouter>
    );

    // Should eventually show the edit form with Save button
    expect(await screen.findByText('Save namespace', {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
