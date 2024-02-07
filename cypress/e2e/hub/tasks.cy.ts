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
    cy.get(
      '[data-cy="row-0"] > [data-cy="name-column-cell"] > .pf-v5-l-flex > [style="max-width: 100%;"] > div > a'
    ).click();
    cy.get('[data-cy="task-detail"]');
    cy.get('[data-cy="task-groups"]');
    cy.get('[data-cy="reserve-resources"]');
  });

  it('should disable stop task button if task is not running/waiting', () => {
    cy.get('tr')
      .contains('td[data-cy="started-column-cell"]', /\S/)
      .parent('tr')
      .then(($row) => {
        cy.wrap($row).find('td').eq(6).click();
      });
    cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');
  });

  it('should stop task if task is running/waiting', () => {
    newRemote = 'e2e' + randomString(4).toLowerCase();
    newRepository = 'e2e' + randomString(4).toLowerCase();
    cy.createRemote(newRemote, 'http://192.0.2.1/');
    cy.createRepository(newRepository, newRemote);
    cy.navigateTo('hub', Repositories.url);
    cy.contains('tr', newRepository).within(() => {
      cy.get('button.toggle-kebab').click();
      cy.get('[data-cy="sync-repository"]').click();
    });
    cy.clickButton('Sync');
    cy.navigateTo('hub', Tasks.url);
    cy.get('tr')
      .contains('td[data-cy="finished-column-cell"]', /^\s*$/)
      .parent('tr')
      .then(($row) => {
        cy.wrap($row).find('td').eq(6).click();
      });
    cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'false').click();
    cy.clickModalConfirmCheckbox();
    cy.get('[data-ouia-component-id="submit"]').click();
    cy.clickButton(/^Close$/);

    cy.deleteRepository(newRepository);
    cy.deleteRemote(newRemote);
  });
});
