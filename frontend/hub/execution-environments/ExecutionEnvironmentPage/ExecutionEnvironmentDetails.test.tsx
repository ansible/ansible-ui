import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExecutionEnvironmentDetails } from './ExecutionEnvironmentDetails';

interface ReadmeType {
  updated_at: string;
  created_at: string;
  text: string;
}

const mockReadmeEmpty: ReadmeType = {
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  text: '',
};

const mockReadmeWithContent: ReadmeType = {
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  text: '# heading1\n## heading2\n**bold text**\n*italic text*\n- list item',
};

const mockReadmeWithGfmTable: ReadmeType = {
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  text: '| Col A | Col B |\n| ----- | ----- |\n| cell1 | cell2 |',
};

describe('ExecutionEnvironmentDetails', () => {
  let readmeMockData: ReadmeType = mockReadmeEmpty;

  const server = setupServer(
    http.get(
      ({ request }) => {
        return (
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/readme/')
        );
      },
      () => {
        return HttpResponse.json(readmeMockData);
      }
    ),
    http.put(
      ({ request }) => {
        return (
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/readme/')
        );
      },
      async ({ request }) => {
        return HttpResponse.json(await request.json());
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    readmeMockData = mockReadmeEmpty;
  });
  afterAll(() => server.close());

  const renderWithFreshCache = () => {
    return render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/details']}>
        <Routes>
          <Route
            path="/execution-environments/:id/details"
            element={<ExecutionEnvironmentDetails />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  test('should show podman pull instructions with correct format', async () => {
    readmeMockData = mockReadmeEmpty;
    renderWithFreshCache();

    await screen.findByText('Instructions');

    expect(screen.getByText('Pull this image')).toBeInTheDocument();

    const clipboardInput = screen.getByTestId('clipboard-copy').querySelector('input');

    expect(clipboardInput?.value).toMatch(/^podman pull .+\/test-ee$/);
    expect(clipboardInput).toHaveAttribute('readonly');
  });

  test('should show empty README state', async () => {
    readmeMockData = mockReadmeEmpty;
    renderWithFreshCache();

    await screen.findByText('No README');

    expect(
      screen.getByText('Add a README with instructions for using this container.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('add-readme')).toHaveTextContent('Add');
  });

  test('should allow editing README with markdown preview', async () => {
    readmeMockData = mockReadmeWithContent;
    const user = userEvent.setup();

    renderWithFreshCache();

    const heading1 = await screen.findByRole('heading', { level: 1, name: 'heading1' });
    const heading2 = screen.getByRole('heading', { level: 2, name: 'heading2' });
    const listItem = screen.getByRole('listitem');
    const preview = heading1.closest('[data-ouia-component-type="PF6/Content"]');

    expect(preview).toBeInTheDocument();
    expect(heading1.tagName).toBe('H1');
    expect(heading2.tagName).toBe('H2');
    expect(preview).toContainElement(heading2);
    expect(listItem.tagName).toBe('LI');
    expect(listItem).toHaveTextContent('list item');
    expect(screen.getByText('bold text').tagName).toBe('STRONG');
    expect(screen.getByText('italic text').tagName).toBe('EM');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await screen.findByTestId('raw-markdown');

    const markdownTextarea = screen.getByTestId('raw-markdown');
    await user.clear(markdownTextarea);
    await user.type(markdownTextarea, '# New Heading\n**new bold text**');

    expect(screen.getByText('Preview')).toBeInTheDocument();

    await waitFor(() => {
      const previewHeading = screen.getByRole('heading', { level: 1, name: 'New Heading' });
      expect(previewHeading.tagName).toBe('H1');
      expect(screen.getByText('new bold text').tagName).toBe('STRONG');
    });

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('should render GFM tables in README', async () => {
    readmeMockData = mockReadmeWithGfmTable;
    renderWithFreshCache();

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Col A')).toBeInTheDocument();
      expect(screen.getByText('cell1')).toBeInTheDocument();
    });
  });
});
