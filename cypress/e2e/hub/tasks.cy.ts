import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { Repositories, Tasks } from './constants';
import { pulpAPI } from '../../support/formatApiPathForHub';

describe('GalaxyKit Installation Check for Repositories', () => {
  before(function () {
    cy.isGalaxyKitInstalled().then((isInstalled) => {
      if (!isInstalled) {
        cy.log('GalaxyKit is not installed, skipping the test suite');
        this.skip();
      }
    });
  });

  describe('Tasks', () => {
    let repository: Repository;
    let remote: HubRemote;

    before(() => {
      cy.createHubRemote().then((remoteResult) => {
        remote = remoteResult;
        cy.createHubRepository({
          repository: {
            remote: remote.pulp_href,
          },
        }).then((r) => {
          repository = r;
        });
      });
    });

    after(() => {
      cy.deleteHubRepository(repository);
      cy.deleteHubRemote(remote);
    });

    it('should click on list item and find all card headers on details page', () => {
      cy.navigateTo('hub', Repositories.url);
      cy.filterTableByTextFilter('name', repository.name);
      cy.clickTableRowAction('name', repository.name, 'sync-repository', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('[data-cy="Submit"]').click();
      cy.hasAlert(`Sync started for repository "${repository.name}"`).should('be.visible');
      cy.navigateTo('hub', Tasks.url);
      cy.verifyPageTitle('Task Management');
      cy.filterTableByTextFilter('Task name', 'pulp_ansible.app.tasks.collections.sync');
      cy.clickTableRowLink('name', 'pulp_ansible.app.tasks.collections.sync', {
        disableFilter: true,
      });
      cy.get('[data-cy="task-detail"]').should('be.visible');
      cy.get('[data-cy="task-groups"]').should('be.visible');
      cy.get('[data-cy="reserve-resources"]').should('be.visible');
      cy.get('[data-cy="status"]').each(($elm) => {
        cy.wrap($elm)
          .invoke('text')
          .then((text) => {
            if (text === 'Completed') {
              cy.get('[data-cy="progress-messages"]').should('be.visible');
            } else {
              cy.get('[data-cy="error-message"]').should('be.visible');
            }
          });
      });
    });

    it('should disable stop task button if task is not running/waiting', () => {
      cy.navigateTo('hub', Tasks.url);
      cy.intercept('GET', pulpAPI`/tasks/*`).as('results');
      cy.filterTableByTextFilter('task-name', 'pulpcore.app.tasks.base.general_delete');
      cy.wait('@results');
      cy.get('tbody tr')
        .contains('td[data-cy="name-column-cell"]', 'pulpcore.app.tasks.base.general_delete')
        .parent('tr')
        .within(() => {
          cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');
        });
    });
  });
});
