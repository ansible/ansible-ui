import { tag } from '../../support/tag';
import { Repositories, Tasks } from './constants';

describe('Tasks', () => {
  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Tasks.url);
  });

  it('should render the tasks page', () => {
    cy.verifyPageTitle('Task Management');
  });

  it('should click on list item and find all card headers on details page', () => {
    cy.createHubRemote().then((remote) => {
      cy.createHubRepository({
        repository: {
          remote: remote.pulp_href,
        },
      }).then((repository) => {
        cy.navigateTo('hub', Repositories.url);
        cy.filterTableBySingleText(repository.name);
        cy.clickTableRowKebabAction(repository.name, 'sync-repository', false);
        cy.get('[data-cy="Submit"]').click();
        cy.hasAlert(`Sync started for repository "${repository.name}"`).should('be.visible');
        cy.navigateTo('hub', Tasks.url);
        cy.clickTableRow('pulp_ansible.app.tasks.collections.sync', false);
        cy.get('[data-cy="task-detail"]').should('be.visible');
        cy.get('[data-cy="task-groups"]').should('be.visible');
        cy.get('[data-cy="reserve-resources"]').should('be.visible');

        cy.deleteHubRepository(repository);
        cy.deleteHubRemote(remote);
      });
    });
  });

  tag(['flaky'], () => {
    it('should disable stop task button if task is not running/waiting', () => {
      cy.createHubRemote().then((remote) => {
        cy.createHubRepository({
          repository: {
            remote: remote.pulp_href,
          },
        }).then((repository) => {
          cy.navigateTo('hub', Repositories.url);
          cy.filterTableBySingleText(repository.name);
          cy.clickTableRowKebabAction(repository.name, 'sync-repository', false);
          cy.get('[data-cy="Submit"]').click();
          cy.hasAlert(`Sync started for repository "${repository.name}"`).should('be.visible');
          cy.navigateTo('hub', Tasks.url);
          cy.filterBySingleSelection(/^Status$/, 'Failed');
          cy.get('tr')
            .contains('td[data-cy="name-column-cell"]', 'pulp_ansible.app.tasks.collections.sync')
            .parent('tr')
            .then(($row) => {
              cy.wrap($row).find('td').eq(6).click();
            });
          cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');

          cy.deleteHubRepository(repository);
          cy.deleteHubRemote(remote);
        });
      });
    });
  });

  it.skip('should stop task if task is running/waiting', () => {
    cy.createHubRemote().then((remote) => {
      cy.createHubRepository({
        repository: {
          remote: remote.pulp_href,
        },
      }).then((repository) => {
        cy.navigateTo('hub', Repositories.url);
        cy.filterTableBySingleText(repository.name);
        cy.clickTableRowKebabAction(repository.name, 'sync-repository', false);
        cy.get('[data-cy="Submit"]').click();
        cy.hasAlert(`Sync started for repository "${repository.name}"`).should('be.visible');
        cy.navigateTo('hub', Tasks.url);
        cy.selectToolbarFilterByLabel(/^Task name$/);
        cy.filterTableByText('pulp_ansible.app.tasks.collections.sync', 'SingleText');
        cy.filterBySingleSelection(/^Status$/, 'Running');
        cy.clickTableRowKebabAction('pulp_ansible.app.tasks.collections.sync', 'stop-task', false);
        cy.clickModalConfirmCheckbox();
        cy.get('[data-ouia-component-id="submit"]').click();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);

        cy.deleteHubRepository(repository);
        cy.deleteHubRemote(remote);
      });
    });
  });
});
