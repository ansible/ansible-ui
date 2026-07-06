/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaProjectCell } from './EdaProjectCell';

const mockProject = {
  id: 5,
  name: 'My EDA Project',
  description: 'A test project',
  url: 'https://github.com/ansible/ansible-ui',
  import_state: 'completed',
};

const server = setupServer(http.get('*/projects/5/', () => HttpResponse.json(mockProject)));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaProjectCell', () => {
  it('should render project name when id is provided', async () => {
    render(
      <MemoryRouter>
        <EdaProjectCell id={5} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My EDA Project')).toBeInTheDocument();
    });
  });

  it('should render project name when disableLink is true', async () => {
    render(
      <MemoryRouter>
        <EdaProjectCell id={5} disableLink />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My EDA Project')).toBeInTheDocument();
    });
  });

  it('should render the numeric id when project data is not yet loaded', () => {
    server.use(
      http.get('*/projects/99/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockProject);
      })
    );

    render(
      <MemoryRouter>
        <EdaProjectCell id={99} />
      </MemoryRouter>
    );

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('should render nothing when id is null', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaProjectCell id={null} />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render nothing when id is undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <EdaProjectCell />
      </MemoryRouter>
    );

    expect(container.textContent).toBe('');
  });

  it('should render the string id when data has not loaded and id is a string-like number', () => {
    server.use(
      http.get('*/projects/42/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockProject);
      })
    );

    render(
      <MemoryRouter>
        <EdaProjectCell id={42} />
      </MemoryRouter>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
