import { Repositories, Tasks } from './constants';
import { randomString } from '../../../framework/utils/random-string';

describe('Tasks', () => {
  let newRemote: string;
  let newRepository: string;

  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Tasks.url);
  });

  it('should render the tasks page', () => {
    cy.verifyPageTitle(Tasks.title);
  });

  it('should click on list item and find all card headers on details page', () => {
    newRemote = 'e2e' + randomString(4).toLowerCase();
    newRepository = 'e2e' + randomString(4).toLowerCase();
    cy.createRemote(newRemote);
    cy.galaxykit('task wait all');
    cy.createRepository(newRepository, newRemote);
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Repositories.url);
    cy.setTablePageSize('100');
    cy.clickTableRowKebabAction(newRepository, 'sync-repository', false);
    cy.get('[data-cy="Submit"]').click();
    cy.navigateTo('hub', Tasks.url);
    cy.clickTableRow('pulp_ansible.app.tasks.collections.sync', false);
    cy.get('[data-cy="task-detail"]');
    cy.get('[data-cy="task-groups"]');
    cy.get('[data-cy="reserve-resources"]');

    cy.deleteRepository(newRepository);
    cy.deleteRemote(newRemote);
  });

  it('should disable stop task button if task is not running/waiting', () => {
    newRemote = 'e2e' + randomString(4).toLowerCase();
    newRepository = 'e2e' + randomString(4).toLowerCase();
    cy.createRemote(newRemote);
    cy.galaxykit('task wait all');
    cy.createRepository(newRepository, newRemote);
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Repositories.url);
    cy.setTablePageSize('100');
    cy.clickTableRowKebabAction(newRepository, 'sync-repository', false);
    cy.get('[data-cy="Submit"]').click();
    cy.navigateTo('hub', Tasks.url);
    cy.filterBySingleSelection(/^Status$/, 'Failed');
    cy.get('tr')
      .contains('td[data-cy="name-column-cell"]', 'pulp_ansible.app.tasks.collections.sync')
      .parent('tr')
      .then(($row) => {
        cy.wrap($row).find('td').eq(6).click();
      });
    cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');
    cy.deleteRepository(newRepository);
    cy.deleteRemote(newRemote);
  });

  it.skip('should stop task if task is running/waiting', () => {
    newRemote = 'e2e' + randomString(4).toLowerCase();
    cy.createRemote(newRemote, 'http://192.0.2.1/');
    cy.galaxykit('task wait all');

    newRepository = 'e2e' + randomString(4).toLowerCase();
    cy.createRepository(newRepository, newRemote);
    cy.galaxykit('task wait all');

    cy.navigateTo('hub', Repositories.url);
    cy.setTablePageSize('100');
    cy.clickTableRowKebabAction(newRepository, 'sync-repository', false);
    cy.get('[data-cy="Submit"]').click();

    cy.navigateTo('hub', Tasks.url);
    cy.selectToolbarFilterType(/^Task name$/);
    cy.filterTableByText('pulp_ansible.app.tasks.collections.sync', 'SingleText');
    cy.filterBySingleSelection(/^Status$/, 'Running');
    cy.clickTableRowKebabAction('pulp_ansible.app.tasks.collections.sync', 'stop-task', false);
    cy.clickModalConfirmCheckbox();
    cy.get('[data-ouia-component-id="submit"]').click();
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);

    cy.deleteRepository(newRepository);
    cy.deleteRemote(newRemote);
  });
});
