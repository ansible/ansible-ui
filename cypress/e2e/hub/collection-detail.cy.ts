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

  beforeEach(() => {
    cy.hubLogin();
    navigateToDetail(namespace, collection);
  });

  after(() => {
    cy.deleteCollection(collection, namespace, 'published');
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
  });

  // very basic check that documentation is rendering and basic operations are working
  it.skip('Documentation tab is working', () => {
    navigateToTab('Documentation');
    cy.contains('Arista EOS Collection');
    cy.contains('Ansible version compatibility');
    cy.contains('The Arista EOS collection supports network_cli and httpapi connections.');

    // search for links in content
    cy.contains(
      `[href="https://github.com/ansible-collections/arista.eos/blob/main/docs/arista.eos.eos_acl_interfaces_module.rst"]`,
      `arista.eos.eos_acl_interfaces`
    );

    // test search in panel
    cy.contains('[data-cy="hub_documentation_panel"]', 'eos_acls');
    cy.contains('[data-cy="hub_documentation_panel"]', 'network');
    cy.get('[data-cy="hub_documentation_panel"] [aria-label="Search input"]').type(
      'eos_acl_interfaces{enter}'
    );
    cy.contains('[data-cy="hub_documentation_panel"]', 'eos_acl_interfaces');
    cy.contains('[data-cy="hub_documentation_panel"]', 'eos_acls').should('not.exist');

    // test partial search in panel
    cy.get('[data-cy="hub_documentation_panel"] [aria-label="Search input"]')
      .clear()
      .type('eos{enter}');
    cy.contains('[data-cy="hub_documentation_panel"]', 'eos_acl_interfaces');
    cy.contains('[data-cy="hub_documentation_panel"]', 'eos_acls');
    cy.contains('[data-cy="hub_documentation_panel"]', 'network').should('not.exist');
  });

  it('Contents tab is working', () => {
    navigateToTab('Contents');
    cy.contains(
        `[href="/collections/published/${namespace}/${collection}/documentation/module/eos_interface?version=1.0.0"]`,
        'eos_interface'
    );
  });
});



function navigateToDetail(namespace: string, collection: string) {
  cy.navigateTo('hub', Collections.url);
  cy.filterTableBySingleText(collection + '{enter}');
  cy.get(`[href="/collections/published/${namespace}/${collection}"]`).click();
  // because of flicking
  cy.wait(1500);
  cy.contains(collection);
  cy.contains(namespace);
}

function navigateToTab(tab: string) {
  cy.contains('[role="tab"]', tab).click();
}
