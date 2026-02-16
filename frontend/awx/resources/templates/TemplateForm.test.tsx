import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateJobTemplate } from './TemplateForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.id as string}
    />
  ),
}));

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/projects/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Project', organization: 1 }] })
  ),
  http.get(awxAPI`/inventories/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Inventory' }] })
  ),
  http.get(awxAPI`/projects/1/`, () =>
    HttpResponse.json({ id: 1, name: 'Demo Project', organization: 1 })
  ),
  http.get(awxAPI`/projects/1/playbooks/`, () =>
    HttpResponse.json(['hello_world.yml', 'test.yml'])
  ),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [] }))
);

describe('TemplateForm - CreateJobTemplate', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Create job template title', async () => {
    render(
      <MemoryRouter>
        <CreateJobTemplate />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Create job template');
    });
  });
});
