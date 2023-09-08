import { randomString } from '../../../framework/utils/random-string';
import { HubDashboard, HubRoutes } from './constants';

const namespaceName = 'e2e_namespace_' + randomString(4, undefined, { isLowercase: true });

const collectionNames: { [key: string]: { [key: string]: string } } = {
  eda: {
    collection1: 'e2e_collection_' + randomString(4, undefined, { isLowercase: true }),
    collection2: 'e2e_collection_' + randomString(4, undefined, { isLowercase: true }),
  },
  storage: {
    collection1: 'e2e_collection_' + randomString(4, undefined, { isLowercase: true }),
  },
};

describe('hub dashboard', () => {
  before(() => {
    cy.hubLogin();
    // Create collections
    Object.keys(collectionNames).forEach((category) => {
      Object.values(collectionNames[category]).forEach((name) => {
        cy.createApprovedCollection(namespaceName, name, [category]);
      });
    });
  });
  after(() => {
    cy.deleteCollectionsInNamespace(namespaceName);
    cy.deleteNamespace(namespaceName);
  });
  it('render the hub dashboard', () => {
    cy.visit(HubRoutes.dashboard);
    cy.get('.pf-c-title').contains(HubDashboard.title);
    cy.get('section.pf-c-page__main-section')
      .first()
      .within(() => {
        cy.get('.pf-c-title').should('contain', HubDashboard.title);
        cy.get('span.pf-c-truncate__start').should('contain', HubDashboard.description);
      });
  });
  it('verify that EDA collections are displayed', () => {
    cy.visit(HubRoutes.dashboard);
    cy.contains('div.pf-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.get(`article.pf-c-card[id=${collectionNames.eda.collection1}]`).should('exist');
      });
  });
  it('clicking on "Go to collections" opens collections UI filtered by EDA collections', () => {
    cy.visit(HubRoutes.dashboard);
    cy.contains('div.pf-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.contains('a', 'Go to collections').click();
      });
    cy.url().should('contain', 'tags=eda');
    cy.get('div.pf-c-toolbar__group').contains('Tags').should('be.visible');
    cy.get('div.pf-c-toolbar__group').contains('eda').should('be.visible');
    cy.getTableRowByText(collectionNames.eda.collection1).should('be.visible');
  });
  it('clicking on Cog icon opens the Manage view modal', () => {
    cy.visit(HubRoutes.dashboard);
    cy.clickButton('Manage view');
    cy.get('.pf-c-modal-box__title-text').should('contain', 'Manage Dashboard');
    cy.get('[aria-label="Close"]').click();
  });
  it('within the Manage Dashboard modal, unchecking a resource should hide the resource', () => {
    cy.visit(HubRoutes.dashboard);
    cy.clickButton('Manage view');
    cy.contains('tr', 'Cloud collections').find('input').uncheck();
    cy.contains('tr', 'Networking collections').find('input').uncheck();
    cy.contains('tr', 'Database collections').find('input').uncheck();
    cy.contains('tr', 'Application collections').find('input').uncheck();
    cy.contains('tr', 'Storage collections').find('input').uncheck();
    cy.clickModalButton('Apply');
    cy.get('div.pf-c-card__header').should('not.contain', 'Storage collections');
    cy.clickButton(/^Manage view/);
    cy.contains('tr', 'Storage collections').find('input').check();
    cy.clickModalButton('Apply');
    cy.contains('div.pf-c-card__header', 'Storage collections').should('be.visible');
  });
});
