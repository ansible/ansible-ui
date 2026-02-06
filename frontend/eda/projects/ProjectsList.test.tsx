import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { Projects } from './Projects';
import mockProjects from './fixtures/edaProjects.fixture.json';
import mockProjectsOptions from './fixtures/edaProjectsOptions.fixture.json';

describe('Projects List Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      server.use(
        http.options(edaAPI`/projects/`, () => HttpResponse.json(mockProjectsOptions)),
        http.get(edaAPI`/projects/`, () => HttpResponse.json(mockProjects))
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Projects' })).toBeInTheDocument();
      expect(
        screen.getByText('A project is a logical collection of rulebooks.')
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Projects' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Git hash' })).toBeInTheDocument();
    });
  });

  describe('Projects Rendering', () => {
    beforeEach(() => {
      server.use(
        http.options(edaAPI`/projects/`, () => HttpResponse.json(mockProjectsOptions)),
        http.get(edaAPI`/projects/`, () => HttpResponse.json(mockProjects))
      );
    });

    it('should render all projects from API response', async () => {
      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Projects' });

      // Verify all fixture projects are rendered
      expect(screen.getByText('project-1')).toBeInTheDocument();
      expect(screen.getByText('project-2')).toBeInTheDocument();
      expect(screen.getByText('project-3')).toBeInTheDocument();
    });

    it('should render correct number of rows', async () => {
      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Projects' });

      // Get table body and count rows
      const rowgroups = screen.getAllByRole('rowgroup');
      const tbody = rowgroups.find((rg) => rg.tagName === 'TBODY');
      expect(tbody).toBeDefined();

      const bodyRows = within(tbody!).getAllByRole('row');
      expect(bodyRows).toHaveLength(3);
    });

    it('should display different import states', async () => {
      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Projects' });

      // Verify completed status (project-1 and project-2)
      const completedStatuses = screen.getAllByText('Completed');
      expect(completedStatuses).toHaveLength(2);

      // Verify running status (project-3)
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  describe('Empty State - RBAC', () => {
    const emptyList = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    it('should show empty state without create button when no POST permission', async () => {
      server.use(
        http.options(edaAPI`/projects/`, () =>
          HttpResponse.json({
            name: 'Project List',
            description: '',
            actions: {}, // No POST action
          })
        ),
        http.get(edaAPI`/projects/`, () => HttpResponse.json(emptyList))
      );

      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Projects' });

      // Wait for empty state (no POST) so cached data from previous tests is not shown
      await screen.findByText('You do not have permission to create a project.');

      // Verify no projects are shown
      expect(screen.queryByText('project-1')).not.toBeInTheDocument();
      expect(screen.queryByText('project-2')).not.toBeInTheDocument();

      // Verify no create button is present
      expect(screen.queryByRole('link', { name: /Create project/i })).not.toBeInTheDocument();
    });

    it('should show empty state with create button when has POST permission', async () => {
      server.use(
        http.options(edaAPI`/projects/`, () => HttpResponse.json(mockProjectsOptions)),
        http.get(edaAPI`/projects/`, () => HttpResponse.json(emptyList))
      );

      render(
        <MemoryRouter>
          <Projects />
        </MemoryRouter>
      );

      // Verify empty state message
      expect(
        await screen.findByText('There are currently no projects created for your organization.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please create a project by using the button below.')
      ).toBeInTheDocument();

      // Verify create button is visible
      expect(screen.getByRole('link', { name: /Create project/i })).toBeInTheDocument();
    });
  });
});
