import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { TemplatesList } from './TemplatesList';

const createMockServer = (canCreateJobTemplate: boolean, canCreateWFJobTemplate: boolean) => {
  const jobTemplateActions = canCreateJobTemplate ? { GET: {}, POST: {} } : { GET: {} };
  const wfJobTemplateActions = canCreateWFJobTemplate ? { GET: {}, POST: {} } : { GET: {} };

  return setupServer(
    http.options(awxAPI`/job_templates/`, () => {
      return HttpResponse.json({
        actions: jobTemplateActions,
      });
    }),
    http.options(awxAPI`/workflow_job_templates/`, () => {
      return HttpResponse.json({
        actions: wfJobTemplateActions,
      });
    }),
    http.options('*/api/controller/v2/unified_job_templates/', () => {
      return HttpResponse.json({
        actions: { GET: {} },
      });
    }),
    http.options('*/api/v2/unified_job_templates/', () => {
      return HttpResponse.json({
        actions: { GET: {} },
      });
    }),
    http.get('*/api/controller/v2/unified_job_templates/', () => {
      return HttpResponse.json({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
    }),
    http.get('*/api/v2/unified_job_templates/', () => {
      return HttpResponse.json({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
    })
  );
};

describe('TemplatesList Empty State', () => {
  describe('when user has both job template and workflow job template permissions', () => {
    const server = createMockServer(true, true);

    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('should render empty state with create template dropdown', async () => {
      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(
        screen.getByText('Please create a template using the button below.')
      ).toBeInTheDocument();

      const createButton = screen.getByTestId('create-template');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeEnabled();
    });

    test('should show both menu options as enabled without disabled tooltips', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const createButton = screen.getByTestId('create-template');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Create job template/i })).toBeInTheDocument();
      });

      const jobTemplateOption = screen.getByRole('menuitem', { name: /Create job template/i });
      const workflowOption = screen.getByRole('menuitem', {
        name: /Create workflow job template/i,
      });

      // Both options should be present in the dropdown
      expect(jobTemplateOption).toBeInTheDocument();
      expect(workflowOption).toBeInTheDocument();

      // Hover over both options to verify no disabled tooltips appear
      await user.hover(jobTemplateOption);
      expect(
        screen.queryByText(
          'Job template creation requires project access. You are not currently assigned to any projects.'
        )
      ).not.toBeInTheDocument();

      await user.hover(workflowOption);
      expect(
        screen.queryByText(
          'You do not have permission to create a workflow job template. Please contact your organization administrator if there is an issue with your access.'
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('when user can only create job template', () => {
    const server = createMockServer(true, false);

    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('should render empty state with create template dropdown', async () => {
      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(
        screen.getByText('Please create a template using the button below.')
      ).toBeInTheDocument();

      const createButton = screen.getByTestId('create-template');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeEnabled();
    });

    test('should show both template options in dropdown with workflow disabled', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const createButton = screen.getByTestId('create-template');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Create job template/i })).toBeInTheDocument();
      });

      const jobTemplateOption = screen.getByRole('menuitem', { name: /Create job template/i });
      const workflowOption = screen.getByRole('menuitem', {
        name: /Create workflow job template/i,
      });

      // Both options should be present in the dropdown
      expect(jobTemplateOption).toBeInTheDocument();
      expect(workflowOption).toBeInTheDocument();

      // Verify workflow option is disabled by checking for the disabled tooltip text
      await user.hover(workflowOption);
      await waitFor(() => {
        expect(
          screen.getByText(
            'You do not have permission to create a workflow job template. Please contact your organization administrator if there is an issue with your access.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('when user has only workflow job template permission', () => {
    const server = createMockServer(false, true);

    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('should render empty state with create template dropdown', async () => {
      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(
        screen.getByText('Please create a template using the button below.')
      ).toBeInTheDocument();

      const createButton = screen.getByTestId('create-template');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeEnabled();
    });

    test('should show both template options in dropdown with job template disabled', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const createButton = screen.getByTestId('create-template');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: /Create workflow job template/i })
        ).toBeInTheDocument();
      });

      const jobTemplateOption = screen.getByRole('menuitem', { name: /Create job template/i });
      const workflowOption = screen.getByRole('menuitem', {
        name: /Create workflow job template/i,
      });

      // Both options should be present in the dropdown
      expect(jobTemplateOption).toBeInTheDocument();
      expect(workflowOption).toBeInTheDocument();

      // Verify job template option is disabled by checking for the disabled tooltip text
      await user.hover(jobTemplateOption);
      await waitFor(() => {
        expect(
          screen.getByText(
            'Job template creation requires project access. You are not currently assigned to any projects.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('when user has neither job template nor workflow job template permission', () => {
    const server = createMockServer(false, false);

    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('should render empty state with permission error message and no create button', async () => {
      render(
        <MemoryRouter>
          <TemplatesList />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('No templates yet')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(
        screen.getByText(
          'Job template creation requires project access. You are not currently assigned to any projects. Additionally, you do not have permissions to create a workflow job template. Please contact your organization administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();

      expect(screen.queryByTestId('create-template')).not.toBeInTheDocument();
    });
  });
});
