import { randomString } from '../../../framework/utils/random-string';
import { Collections } from './constants';

describe('Collections- List View', () => {
  const collection = 'hub_e2e_' + randomString(5).toLowerCase();
  const namespace = 'hub_e2e_' + randomString(5).toLowerCase();

  before(() => {
    cy.galaxykit(`namespace create ${namespace}`);
    cy.galaxykit('task wait all');
    cy.galaxykit(`collection upload ${namespace} ${collection} --template eos`);
    cy.galaxykit('task wait all');
    cy.galaxykit(`collection move ${namespace} ${collection} 1.0.0 staging published`);
  });

  after(() => {
    cy.deleteCollection(collection, namespace, 'published');
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
  });

  it('Can see collection detail', () => {
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection + '{enter}');
    cy.contains(collection);
    cy.contains(namespace);
  });
});
