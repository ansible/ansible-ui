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

  beforeEach( () => {
    cy.hubLogin();
    navigateToDetail(namespace, collection);
  });

  after(() => {
   /* cy.deleteCollection(collection, namespace, 'published');
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);*/
  });

  // very basic check that documentation is rendering and basic operations are working
  it('Documentation tab is working', () => {
    navigateToTab('Documentation');
    cy.contains('Arista EOS Collection');
    cy.contains('Ansible version compatibility');
    cy.contains('The Arista EOS collection supports network_cli and httpapi connections.');

        
    // test search
    cy.contains('eos_acls');
    cy.contains('network');
    cy.get('[aria-label="Search input"]').type('eos_acl_interfaces{enter}');
    cy.contains('eos_acl_interfaces');
    cy.contains('eos_acls').should('not.exist');

    // test partial search
    cy.get('[aria-label="Search input"]').clear().type('eos{enter}');
    cy.contains('eos_acl_interfaces');
    cy.contains('eos_acls');
    cy.contains('network').should('not.exist');

  });
});

function navigateToDetail(namespace : string, collection : string)
{
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection + '{enter}');
    cy.get(`[href="/collections/published/${namespace}/${collection}"]`).click();
    // because of flicking
    cy.wait(1500);
    cy.contains(collection);
    cy.contains(namespace);
}

function navigateToTab(tab : string)
{
    cy.contains('[role="tab"]', tab).click();
}
