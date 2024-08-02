import { randomString } from '../../../framework/utils/random-string';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { MyImports, Namespaces } from './constants';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

describe('Namespaces', () => {
  it('create, search and delete a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('link-text-0').type('test link');
    cy.getByDataCy('link-url-0').type('https://test.com');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.getByDataCy('namespace-cli-tab').should('contain', 'CLI Configuration');
    cy.getByDataCy('namespace-cli-tab').click();
    cy.get('.pf-v5-c-truncate__start').should('contain', apiPrefix);
    // Delete namespace
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('delete-namespace').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('should show namespace details tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    cy.setTableView('table');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('description').type('test description');
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('link-text-0').type('test link');
    cy.getByDataCy('link-url-0').type('https://test.com');

    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle(namespaceName);
    cy.getByDataCy('name').should('contain', namespaceName);
    cy.getByDataCy('description').should('contain', 'test description');
    cy.getByDataCy('company').should('contain', 'test company');
    cy.getByDataCy('key-value-list-title').should('contain', 'Useful links');
    cy.getByDataCy('item-key-0').should('contain', 'test link');
    const linkUrl = 'https://test.com';
    cy.getByDataCy(`item-value-${linkUrl}`).should('contain', linkUrl);
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('delete-namespace').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('should show collections tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('description').type('test description');
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.getByDataCy('collections-tab').should('contain', 'Collections');
    cy.getByDataCy('collections-tab').click();
    cy.getByDataCy('empty-state-title').should('contain', 'No collections yet');
    cy.getByDataCy('upload-collection').should('contain', 'Upload collection');

    // Delete the edited namespace
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('delete-namespace').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('edit a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.getByDataCy('edit-namespace').click();
    cy.getByDataCy('company').clear().type('new company');
    cy.getByDataCy('description').clear().type('new description');
    cy.getByDataCy('Submit').click();
    cy.getByDataCy('company').contains(/^new company$/);
    cy.getByDataCy('description').contains(/^new description$/);

    // Delete the edited namespace
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('delete-namespace').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('explore different views and pagination', () => {
    cy.createHubNamespace().then((namespace) => {
      cy.navigateTo('hub', Namespaces.url);
      cy.verifyPageTitle('Namespaces');
      cy.setTablePageSize('50');
      cy.filterTableBySingleText(namespace.name);
      cy.setTableView('card');
      cy.contains(namespace.name).should('be.visible');
      cy.setTableView('list');
      cy.contains(namespace.name).should('be.visible');
      cy.setTableView('table');
      cy.contains(namespace.name).should('be.visible');
      cy.clickTableRowAction('name', namespace.name, 'delete-namespace', {
        inKebab: true,
        disableFilter: true,
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete namespaces/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('user can view import logs', () => {
    cy.createHubNamespace().then((namespace) => {
      cy.visit(`${Namespaces.url}/${namespace.name}`);

      cy.clickPageAction('imports');
      cy.url().should('include', MyImports.url);
      cy.url().should('include', namespace.name);
      cy.verifyPageTitle(MyImports.title);
      cy.get('#namespace-selector').contains(namespace.name);

      cy.deleteHubNamespace(namespace);
    });
  });

  it('user can bulk dekete namespaces', () => {
    cy.createHubNamespace().then((namespace1) => {
      cy.createHubNamespace().then((namespace2) => {
        cy.navigateTo('hub', 'namespaces');
        cy.verifyPageTitle('Namespaces');
        cy.setTablePageSize('50');
        cy.setTableView('table');
        cy.selectTableRow(namespace1.name, false);
        cy.selectTableRow(namespace2.name, false);
        cy.clickToolbarKebabAction('delete-namespaces');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete namespaces');
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
      });
    });
  });
});

describe('Namespaces Tabbed View Tests - CRUD actions', () => {
  let namespace: HubNamespace;
  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
  });

  after(() => {
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'namespaces');
    cy.verifyPageTitle('Namespaces');
    cy.setTableView('table');
    cy.filterTableByTextFilter('name', namespace.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', namespace.name, { disableFilter: true });
  });

  function removeRoleFromListRow(roleName: string, assignmentType: string) {
    cy.intercept('DELETE', hubAPI`/role_${assignmentType}_assignments/*`).as('deleteRole');
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      cy.wait('@deleteRole')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/).should('be.visible');
          cy.containsBy('button', /^Close$/).click();
        });
    });
  }

  it('create a new namespace, from the user access tab assign a user and apply role(s) to the user of the namespace', () => {
    cy.intercept('POST', hubAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.selectTableRowByCheckbox('username', hubUser.username, { disableFilter: true });

        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.collection_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.collection_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.collection_namespace_owner',
            'Change and upload collections to namespaces.',
            'Credential Admin',
            'Upload and modify collections.',
          ],
          '2'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@userRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_namespace_owner', 'user');
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_publisher', 'user');
    });
  });

  it('create a new namespace, from the team access tab assign a user and apply role(s) to the team of the namespace', () => {
    cy.intercept('POST', hubAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select teams(s)').should('be.visible');
        cy.selectTableRowByCheckbox('name', hubTeam.name, { disableFilter: true });

        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.collection_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.collection_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [hubTeam.name], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.collection_namespace_owner',
            'Change and upload collections to namespaces.',
            'galaxy.collection_publisher',
            'Upload and modify collections.',
          ],
          '2'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@teamRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_namespace_owner', 'team');
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_publisher', 'team');
    });
  });
});
