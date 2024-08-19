import { randomString } from '../../../framework/utils/random-string';
import { Namespaces } from './constants';

function visitImports(namespace: string) {
  cy.navigateTo('hub', Namespaces.url);
  cy.verifyPageTitle('Namespaces');
  cy.getByDataCy('table-view').click();
  cy.filterTableBySingleText(namespace);
  // dropdown is not within row: cy.clickTableRowKebabAction(namespace, 'imports', false);
  cy.getTableRowByText(namespace, false).within(() => {
    cy.get('[data-cy*="actions-dropdown"]').click();
  });
  cy.getByDataCy('imports').click();

  cy.verifyPageTitle('My imports');
}

describe('My imports', () => {
  const validCollection = {
    namespace: `testnamespace${randomString(4, undefined, { isLowercase: true })}`,
    name: `testcollection_${randomString(4, undefined, { isLowercase: true })}`,
    version: '1.0.0',
  };

  before(() => {
    cy.createHubNamespace({ namespace: { name: validCollection.namespace } }).then(() => {
      cy.uploadCollection(validCollection.name, validCollection.namespace, validCollection.version);
    });
    cy.waitForAllTasks();
  });

  after(() => {
    cy.deleteCollectionsInNamespace(validCollection.namespace);
    cy.deleteHubNamespace({ name: validCollection.namespace });
  });

  it('should render empty states', () => {
    // Go to Imports and de-select namespace
    const { namespace } = validCollection;
    visitImports(namespace);
    cy.getByDataCy('reset').click();
    // Check Empty state when no namespace is selected
    cy.contains('No namespace selected.');
    cy.contains('No data');
    cy.get('#namespace-selector').contains('Select namespace');
    cy.get('.pf-v5-c-chip-group').should('not.exist');
  });

  it('should be able to inspect completed collection import', () => {
    const { name, namespace, version } = validCollection;
    visitImports(namespace);

    // test correctly set label params
    cy.get('#namespace-selector').contains(namespace);

    cy.get(`[data-cy="row-id-${name}"]`).within(() => {
      cy.get('h4').contains(`${name} v${version}`);
      cy.get('div:contains("completed")');
    });

    cy.get('[data-cy="import-log-content"]').within(() => {
      cy.get('h3').contains(`${namespace}.${name}`);
      cy.contains('Completed');
      cy.contains(version);
      cy.contains('waiting for approval');

      cy.get('[data-cy="import-console"]').contains('Collection loading complete');
    });
  });

  it('should be able to filter imported collections', () => {
    const { namespace } = validCollection;
    visitImports(validCollection.namespace);
    cy.get('#namespace-selector').contains(namespace);
    cy.get('#namespace-selector').click();
    cy.get('.pf-v5-c-menu__footer').contains('Browse').click();

    // search and select namespace in button
    cy.get('.pf-v5-c-modal-box__header').click();
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.getTableRowBySingleText(validCollection.namespace).within(() => {
        cy.get('td[data-cy=checkbox-column-cell]').click();
      });
    });
    cy.clickModalButton('Confirm');

    cy.filterTableBySingleText(validCollection.name);
    cy.filterTableByTypeAndSingleText('Version', validCollection.version);
    cy.filterBySingleSelection('Status', 'Completed');

    cy.get('.pf-v5-c-chip-group').contains(validCollection.name);
    cy.get('.pf-v5-c-chip-group').contains(validCollection.version);

    cy.url().should('include', validCollection.namespace);
    cy.url().should('include', validCollection.name);

    cy.get(`[data-cy="row-id-${validCollection.name}"]`).within(() => {
      cy.get('h4').contains(`${validCollection.name} v${validCollection.version}`);
      cy.contains('Completed');
    });

    cy.clickButton('Clear all filters');
    cy.get('.pf-v5-c-toolbar__group').contains(validCollection.name).should('not.exist');
    cy.get('.pf-v5-c-toolbar__group').contains(validCollection.version).should('not.exist');
    cy.get('.pf-v5-c-toolbar__group').contains('Completed').should('not.exist');
    cy.get('.pf-v5-c-chip-group').should('not.exist');
  });
});
