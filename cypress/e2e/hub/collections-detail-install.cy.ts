import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

// cypress
describe('collections-detail-install', () => {
  let collectionName: string = '';
  let namespaceName: string = '';

  function goToInstallTab() {
    cy.navigateTo('hub', Collections.url);
    cy.get(`[data-cy="table-view"] button`).click();
    cy.filterTableBySingleText(collectionName);
    cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
    cy.contains('a', collectionName).click();
    cy.getByDataCy('collection-install-tab').click();
  }

  beforeEach(() => {
    namespaceName = randomE2Ename();
    collectionName = randomE2Ename();

    cy.createHubNamespace({ namespace: { name: namespaceName } }).then(() => {
      cy.uploadCollection(collectionName, namespaceName, '1.0.0');
    });
  });

  it('can download tarball', () => {
    goToInstallTab();

    cy.contains('Install');
    cy.contains('License');
    cy.contains('Installation');
    cy.contains('GPL-3.0-or-later');

    // can go to documentation
    cy.contains('a', 'Go to documentation').click();
    cy.contains('Documentation (1)');

    goToInstallTab();
    cy.contains('a', 'Distributions').click();
    cy.contains('CLI configuration');

    goToInstallTab();

    // should have the correct tags
    cy.contains('span', 'tools');

    // should have the correct ansible version
    cy.contains('Ansible >=2');

    // for now we test button is rendered
    cy.contains('button', 'Download tarball');

    cy.contains('button', 'Show signature').click();
    //cy.contains('BEGIN PGP SIGNATURE');
  });

  afterEach(() => {
    cy.deleteHubCollectionByName(collectionName);
  });
});
