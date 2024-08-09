import { randomString } from '../../../framework/utils/random-string';
import { MyImports, Namespaces } from './constants';

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

  const invalidCollection = {
    namespace: `testnamespace${randomString(4, undefined, { isLowercase: true })}`,
    name: `testcollection_INVALID${randomString(4)}`,
    version: '1.0.0',
  };

  before(() => {
    cy.createNamespace(validCollection.namespace);
    cy.galaxykit(`-i collection upload ${validCollection.namespace} ${validCollection.name}`);

    cy.createNamespace(invalidCollection.namespace);
    cy.galaxykit(`-i collection upload ${invalidCollection.namespace} ${invalidCollection.name}`);
    cy.waitForAllTasks();
  });

  after(() => {
    cy.deleteCollectionsInNamespace(validCollection.namespace);
    cy.deleteCollectionsInNamespace(invalidCollection.namespace);

    cy.deleteNamespace(validCollection.namespace);
    cy.deleteNamespace(invalidCollection.namespace);
  });

  // no way to get there without a namespace without cy.visit, until the clear button works, or until my imports is in nav
  it.skip('should render empty states', () => {
    cy.navigateTo('hub', MyImports.url);
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
    cy.get('.pf-v5-c-chip-group').contains(name);
    cy.get('.pf-v5-c-chip-group').contains(version);

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

  it('should be able to inspect failed collection import', () => {
    const { name, namespace, version } = invalidCollection;
    visitImports(namespace);

    cy.get('#namespace-selector').contains(namespace);
    cy.get('.pf-v5-c-chip-group').contains(name);
    cy.get('.pf-v5-c-chip-group').contains(version);

    cy.get(`[data-cy="row-id-${name}"]`).within(() => {
      cy.get('h4').contains(`${name} v${version}`);
      cy.contains('Failed');
      cy.contains('failed');
    });

    cy.get('[data-cy="import-log-content"]').within(() => {
      cy.get('h3').contains(`${namespace}.${name}`);
      cy.contains('Failed');
      cy.contains(version);
      cy.contains('---');

      cy.get('[data-cy="import-error"]').contains(
        `Invalid collection metadata. 'name' has invalid format: ${name}`
      );

      cy.get('[data-cy="import-error"] .pf-v5-c-button').click();
      cy.get('pre').should('be.visible');

      cy.get('[data-cy="import-console"]').contains('Importing with galaxy-importer');
    });
  });

  it('should be able to filter imported collections', () => {
    visitImports(validCollection.namespace);
    cy.get('#namespace-selector').contains('Select namespace').click();

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

    cy.get('#namespace-selector').contains(`${validCollection.namespace}`).click();
    cy.get('.pf-v5-c-menu__footer').contains('Browse').click();
    cy.get('.pf-v5-c-modal-box__header').click();
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.getTableRowBySingleText(invalidCollection.namespace).within(() => {
        cy.get('td[data-cy=checkbox-column-cell]').click();
      });
    });
    cy.clickModalButton('Confirm');

    cy.clickButton('Clear all filters');
    cy.get('.pf-v5-c-toolbar__group').contains(validCollection.name).should('not.exist');
    cy.get('.pf-v5-c-toolbar__group').contains(validCollection.version).should('not.exist');
    cy.get('.pf-v5-c-toolbar__group').contains('Completed').should('not.exist');
    cy.get('.pf-v5-c-chip-group').should('not.exist');

    cy.filterBySingleSelection('Status', 'Failed');
    cy.filterTableByTypeAndSingleText('Name', invalidCollection.name);
    cy.filterTableByTypeAndSingleText('Version', invalidCollection.version);

    cy.get('.pf-v5-c-chip-group').contains(invalidCollection.name);
    cy.get('.pf-v5-c-chip-group').contains(invalidCollection.version);

    cy.get(`[data-cy="row-id-${invalidCollection.name}"]`).within(() => {
      cy.get('h4').contains(`${invalidCollection.name} v${invalidCollection.version}`);
      cy.contains('Failed');
    });

    cy.get('.pf-v5-c-button').contains('Clear all filters').click();
    cy.get('.pf-v5-c-button').contains('Clear all filters').should('not.exist');
  });
});
