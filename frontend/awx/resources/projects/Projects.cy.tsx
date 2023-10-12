import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { Projects } from './Projects';

/*
Projects list test cases
1. Projects list loads
2. Filter by project name, type, description, created by, modified by
3. RBAC enable/disable project C(reate)/Copy, wR(ite), U(pdate)/Sync, D(elete)
4. Project sync calls /update API endpoint
5. Handle 500 error state
6. Handle empty state
*/

describe('projects.cy.ts', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/projects/*',
        },
        {
          fixture: 'projects.json',
        }
      ).as('projectsList');
    });

    it('Projects list renders', () => {
      cy.mount(<Projects />);
      cy.verifyPageTitle('Projects');
      cy.get('tbody').find('tr').should('have.length', 11);
    });

    it('Projects list has filters for Name, Description, Type, Created By, and Modified By', () => {
      cy.mount(<Projects />);
      cy.verifyPageTitle('Projects');
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Type$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
      });
    });

    it('Filter projects by name', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?name__icontains=foo*').as('nameFilterRequest');
      cy.filterTableByTypeAndText(/^Name$/, 'foo');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by description', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?description__icontains=bar*').as('descriptionFilterRequest');
      cy.filterTableByTypeAndText(/^Description$/, 'bar');
      cy.wait('@descriptionFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by created by', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?created_by__username__icontains=baz*').as(
        'createdByFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Created by$/, 'baz');
      cy.wait('@createdByFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by modified by', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?modified_by__username__icontains=qux*').as(
        'modifiedByFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Modified by$/, 'qux');
      cy.wait('@modifiedByFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by Type = Git', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?scm_type=git&order_by=name&page=1&page_size=10').as(
        'scmGitTypeFilterRequest'
      );
      cy.filterByMultiSelection(/^Type$/, /^Git$/);
      cy.wait('@scmGitTypeFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by Type = Subversion', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?scm_type=svn&order_by=name&page=1&page_size=10').as(
        'scmSvnTypeFilterRequest'
      );
      cy.filterByMultiSelection(/Type$/, /^Subversion$/);
      cy.wait('@scmSvnTypeFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by Type = Insights', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?scm_type=insights&order_by=name&page=1&page_size=10').as(
        'scmInsightsTypeFilterRequest'
      );
      cy.filterByMultiSelection(/Type$/, /^Red Hat insights$/);
      cy.wait('@scmInsightsTypeFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by Type = Manual', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?scm_type=&order_by=name&page=1&page_size=10').as(
        'scmManualTypeFilterRequest'
      );
      cy.filterByMultiSelection(/Type$/, /^Manual$/);
      cy.wait('@scmManualTypeFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter projects by Type = Remote Archive', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/?scm_type=archive&order_by=name&page=1&page_size=10').as(
        'scmArchiveTypeFilterRequest'
      );
      cy.filterByMultiSelection(/Type$/, /^Remote archive$/);
      cy.wait('@scmArchiveTypeFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Sync project calls API /update endpoint', () => {
      cy.mount(<Projects />);
      cy.intercept('api/v2/projects/6/update/').as('projectUpdateRequest');
      cy.contains('td', 'Demo Project')
        .parent()
        .within(() => {
          cy.get('#sync-project').click();
        });
      // A network request is made to /update based on project id selected on the UI
      cy.wait('@projectUpdateRequest');
    });

    it('Create Project button is disabled if the user does not have permission to create projects', () => {
      cy.mount(<Projects />);
      cy.contains('a', /^Create project$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Cancel project sync toolbar button shows error dialog if project sync is not running', () => {
      cy.mount(<Projects />);
      cy.selectTableRow(' Project 1 Org 0');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-c-dropdown__menu-item')
          .contains('a', 'Cancel selected projects')
          .click();
      });
      cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
        cy.hasAlert(
          '1 of the selected project sync jobs cannot be canceled because they are not running.'
        ).should('exist');
        cy.contains('td', ' Project 1 Org 0')
          .parent()
          .within(() => {
            cy.get('span.pf-c-icon span.pf-m-warning').should('exist');
          });
        cy.clickButton(/^Cancel$/);
      });
      cy.clickButton(/^Clear all filters$/);
    });

    it('Cancel project sync toolbar button shows error dialog if user has insufficient permissions', () => {
      cy.mount(<Projects />);
      cy.selectTableRow(' Project 2 Org 0');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-c-dropdown__menu-item')
          .contains('a', 'Cancel selected projects')
          .click();
      });
      cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
        cy.hasAlert(
          '1 of the selected project sync jobs cannot be cancelled due to insufficient permissions.'
        ).should('exist');
        cy.contains('td', ' Project 2 Org 0')
          .parent()
          .within(() => {
            cy.get('span.pf-c-icon span.pf-m-warning').should('exist');
          });
        cy.clickButton(/^Cancel$/);
      });
      cy.clickButton(/^Clear all filters$/);
    });

    it('Sync, Copy, Delete Project button is disabled if the user does not have permission(s)', () => {
      cy.mount(<Projects />);
      cy.contains('td', ' Project 1 Org 0')
        .parent()
        .within(() => {
          cy.get('#sync-project').should('have.attr', 'aria-disabled', 'true');
          cy.get('.pf-c-dropdown__toggle').click();
          cy.get('.pf-c-dropdown__menu-item')
            .contains(/^Copy project$/)
            .should('have.attr', 'aria-disabled', 'true');
          cy.get('.pf-c-dropdown__menu-item')
            .contains(/^Delete project$/)
            .should('have.attr', 'aria-disabled', 'true');
        });
    });

    it('Sync project kebab button is disabled for project with active sync status', () => {
      cy.mount(<Projects />);
      cy.contains('td', ' Project 3 Org 0')
        .parent()
        .within(() => {
          cy.get('#sync-project').trigger('mouseenter');
          cy.get('#sync-project').should('have.attr', 'aria-disabled', 'true');
        });
      cy.get('.pf-c-tooltip')
        .contains(/^The project cannot be synced because a sync job is currently running$/)
        .should('be.visible');
    });

    it('Cancel project sync kebab button is visible for project with active sync status and is hidden for project with non active sync status', () => {
      cy.mount(<Projects />);
      // select project with active sync status
      cy.contains('td', ' Project 10 Org 2')
        .parent()
        .within(() => {
          cy.get('#cancel-project-sync').should('exist');
        });
      // select prorject with non-active sync status
      cy.contains('td', ' Project 1 Org 0')
        .parent()
        .within(() => {
          cy.get('#cancel-project-sync').should('not.exist');
        });
    });

    it('Cancel project sync row button is disabled for user with insufficient permissions', () => {
      cy.mount(<Projects />);
      // select project with active sync status
      cy.contains('td', ' Project 10 Org 2')
        .parent()
        .within(() => {
          cy.get('#cancel-project-sync').trigger('mouseenter');
          cy.get('#cancel-project-sync').should('have.attr', 'aria-disabled', 'true');
        });
      cy.get('.pf-c-tooltip')
        .contains(/^The project sync cannot be canceled due to insufficient permission$/)
        .should('be.visible');
    });

    it('Create Project button is enabled if the user has permission to create projects', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.Text,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this project.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Projects />);
      cy.contains('a', /^Create project$/).should('have.attr', 'aria-disabled', 'false');
    });

    it('Displays error if projects are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/projects/*',
        },
        {
          statusCode: 500,
        }
      ).as('projectsError');
      cy.mount(<Projects />);
      cy.contains('Error loading projects');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/projects/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create projects', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.Text,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this project.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Projects />);
      cy.contains(/^There are currently no projects added to your organization.$/);
      cy.contains(/^Please create a project by using the button below.$/);
      cy.contains('button', /^Create project$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create projects', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Projects />);
      cy.contains(/^You do not have permission to create a project$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create project$/).should('not.exist');
    });
  });
});
