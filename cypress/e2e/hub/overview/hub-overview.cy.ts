import { randomString } from '../../../../framework/utils/random-string';
import { hubAPI } from '../../../support/formatApiPathForHub';
import { HubOverview } from '../constants';

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

describe.skip('HUB Overview', () => {
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
    cy.navigateTo('hub', 'overview');
    cy.get('.pf-v5-c-title').contains(HubOverview.title);
    cy.get('section.pf-v5-c-page__main-section')
      .first()
      .within(() => {
        cy.get('.pf-v5-c-title').should('contain', HubOverview.title);
        cy.get('span.pf-v5-c-truncate__start').should('contain', HubOverview.description);
      });
    cy.contains('button', 'Manage view').should('be.visible');
  });
  it('verify that EDA collections are displayed', () => {
    cy.navigateTo('hub', 'overview');
    cy.contains('div.pf-v5-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.get(`.pf-v5-c-card[id=${collectionNames.eda.collection1}]`).should('exist');
      });
  });
  it('verify that API request indicated a limit of 12 collections sorted by latest created timestamp', () => {
    cy.intercept(
      'GET',
      hubAPI`/v3/plugin/ansible/search/collection-versions/?limit=12&order_by=-pulp_created&tags=eda`,
      (req) => {
        req.alias = 'latest12collections';
      }
    );
    cy.navigateTo('hub', 'overview');
    cy.contains('div.pf-v5-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.get(`.pf-v5-c-card[id=${collectionNames.eda.collection1}]`).should('exist');
      });
    // assert that a matching request has been made
    cy.wait('@latest12collections');
  });
  it('verify that collection name links to collection details', () => {
    cy.navigateTo('hub', 'overview');
    cy.contains('div.pf-v5-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.contains('a', collectionNames.eda.collection1).click();
      });
    cy.url()
      .should('include', '/collections/')
      .should('include', `?name=${collectionNames.eda.collection1}`);
  });
  it('clicking on "Go to collections" opens collections UI filtered by EDA collections', () => {
    cy.navigateTo('hub', 'overview');
    cy.contains('div.pf-v5-c-card__header', 'Event-Driven Ansible content')
      .parent()
      .within(() => {
        cy.contains('a', 'Go to collections').click();
      });
    cy.url().should('contain', 'tags=eda');
    cy.get('div.pf-v5-c-toolbar__group').contains('Tags').should('be.visible');
    cy.get('div.pf-v5-c-toolbar__group').contains('eda').should('be.visible');
    cy.getListRowByText(collectionNames.eda.collection1).should('be.visible');
  });
  describe('Manage view modal', () => {
    it('clicking on Cog icon opens the Manage view modal', () => {
      cy.navigateTo('hub', 'overview');
      cy.clickButton('Manage view');
      cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage Dashboard');
      cy.clickModalButton('Cancel');
      cy.get('div.pf-v5-c-backdrop').should('not.exist');
    });
    it('unselecting all categories in the Manage results in an empty state UI on the dashboard', () => {
      cy.navigateTo('hub', 'overview');
      cy.clickButton('Manage view');
      cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage Dashboard');
      cy.contains('tr', 'Cloud collections').find('input').uncheck();
      cy.contains('tr', 'Networking collections').find('input').uncheck();
      cy.contains('tr', 'Database collections').find('input').uncheck();
      cy.contains('tr', 'Application collections').find('input').uncheck();
      cy.contains('tr', 'Storage collections').find('input').uncheck();
      cy.contains('tr', 'Event-Driven Ansible content').find('input').uncheck();
      cy.clickModalButton('Apply');
      cy.get('div.pf-v5-c-empty-state__content').within(() => {
        cy.get(`[data-cy="empty-state-title"]`).should(
          'contain',
          'There is currently no content selected to be shown on the dashboard.'
        );
        cy.contains('button', 'Manage view').should('be.visible');
        cy.clickButton('Manage view');
      });
      cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage Dashboard');
      // Reset dashboard
      cy.contains('tr', 'Cloud collections').find('input').check();
      cy.contains('tr', 'Networking collections').find('input').check();
      cy.contains('tr', 'Database collections').find('input').check();
      cy.contains('tr', 'Application collections').find('input').check();
      cy.contains('tr', 'Storage collections').find('input').check();
      cy.contains('tr', 'Event-Driven Ansible content').find('input').check();
      cy.clickModalButton('Apply');
    });
    it('within the Manage Dashboard modal, checking/unchecking a resource should display/hide the resource', () => {
      cy.navigateTo('hub', 'overview');
      cy.clickButton('Manage view');
      cy.contains('tr', 'Storage collections').find('input').uncheck();
      cy.clickModalButton('Apply');
      cy.get('div.pf-v5-c-backdrop').should('not.exist');
      cy.get('div.pf-v5-c-card__header').should('not.contain', 'Storage collections');
      cy.clickButton(/^Manage view/);
      cy.contains('tr', 'Storage collections').find('input').check();
      cy.clickModalButton('Apply');
      cy.contains('div.pf-v5-c-card__header', 'Storage collections').should('be.visible');
    });
    it('reordering categories within the Manage View modal should be reflected in the dashboard', () => {
      let initialArray: string[];
      let editedArray: string[];
      cy.navigateTo('hub', 'overview');

      cy.get('.page-dashboard-card .pf-v5-c-card__header').then((headers) => {
        initialArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
        cy.clickButton('Manage view');
        cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Manage Dashboard');
        cy.get('#draggable-row-storage').drag('#draggable-row-eda');
        cy.clickModalButton('Apply');
      });
      cy.get('.page-dashboard-card .pf-v5-c-card__header').then((headers) => {
        editedArray = Array.from(headers, (title) => title.innerText.split('\n')[0]);
        expect(initialArray).to.not.eql(editedArray);
      });
    });
  });
});
