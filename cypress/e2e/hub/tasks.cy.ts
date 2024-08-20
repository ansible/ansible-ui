import { Repositories, Tasks } from './constants';
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';

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
    cy.filterBySingleSelection(/^Status$/, 'Completed');
    cy.get('tr')
      .contains('td[data-cy="name-column-cell"]', 'pulpcore.app.tasks.base.general_delete')
      .parent('tr');
    cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');
  });
});
