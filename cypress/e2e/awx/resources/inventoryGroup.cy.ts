import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { AwxHost } from '../../../../frontend/awx/interfaces/AwxHost';

describe('Inventory Groups', () => {
  let organization: Organization;
  let inventory: Inventory;
  let machineCredential: Credential;
  let executionEnvironment: ExecutionEnvironment;
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateGroupName(): string {
    return `test-${testSignature}-inventory-group-${randomString(5, undefined, { isLowercase: true })}`;
  }

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAWXCredential({
        kind: 'machine',
        organization: organization.id,
        credential_type: 1,
      }).then((cred) => {
        machineCredential = cred;
      });
      cy.createAwxExecutionEnvironment({ organization: organization.id }).then((ee) => {
        executionEnvironment = ee;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Inventory Groups - List View', () => {
    it('can create a group, assert info on details page, then delete group from the list view', () => {
      cy.createAwxInventory().then((inv) => {
        inventory = inv;
        const newGroupName = 'E2E Group ' + randomString(4);
        cy.intercept('POST', awxAPI`/groups/`).as('createGroup');
        cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/groups?`);
        cy.clickButton(/^Create group$/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name"]').type(newGroupName);
        cy.get('[data-cy="description"]').type('This is a description');
        cy.dataEditorTypeByDataCy('variables', 'test: true');
        cy.clickButton(/^Save/);
        cy.wait('@createGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(201);
          });
        cy.hasDetail(/^Name$/, newGroupName);
        cy.hasDetail(/^Description$/, 'This is a description');
        cy.hasDetail(/^Variables$/, 'test: true');
        cy.contains('span', 'Back to Groups').click();
        cy.filterTableBySingleSelect('name', newGroupName);
        cy.get('[data-ouia-component-id="simple-table"]').within(() => {
          cy.get('tbody tr').should('have.length', 1);
          cy.get('[data-cy="checkbox-column-cell"] input').click();
        });
        cy.clickToolbarKebabAction('delete-selected-groups');
        cy.intercept('DELETE', awxAPI`/groups/*/`).as('deleted');
        cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
        cy.get('[data-cy="delete-group-modal-delete-button"]').click();
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
        cy.clickButton(/^Clear all filters$/);
        cy.getByDataCy('empty-state-title').should(
          'contain',
          'There are currently no groups added to this inventory.'
        );

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can edit an inventory group from the groups list view', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;

        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.get(`[href*="/infrastructure/inventories/inventory/${inventory.id}/hosts?"]`).click();
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickTab(/^Groups$/, true);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowKebabAction(group.name, 'edit-group', false);
        cy.verifyPageTitle('Edit group');
        cy.get('[data-cy="name-form-group"]').type('-changed');
        cy.get('[data-cy="Submit"]').click();
        cy.verifyPageTitle(group.name + '-changed');

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can run an ad-hoc command against a group', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory } = result;
        cy.navigateTo('awx', 'inventories');
        const intercept_url = awxAPI`/inventories/?page_size=20&order_by=name&name__icontains=${inventory.name}`;
        cy.intercept('GET', intercept_url).as('filteredInventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.wait('@filteredInventories');
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickTab(/^Groups$/, true);
        cy.clickKebabAction('actions-dropdown', 'run-command');
        cy.selectDropdownOptionByResourceName('module-name', 'shell');
        cy.getByDataCy('module-args-form-group').type('argument');
        cy.selectDropdownOptionByResourceName('verbosity', '1 (Verbose)');
        cy.getByDataCy('limit-form-group').within(() => {
          cy.get('input').clear().type('limit');
        });
        cy.getByDataCy('forks-form-group').within(() => {
          cy.get('input').clear().type('1');
        });
        cy.getByDataCy('diff-mode-form-group').within(() => {
          cy.get('.pf-v5-c-form__group-control > label').click();
        });
        cy.getByDataCy('become_enabled').click();
        cy.clickButton(/^Next$/);
        cy.getByDataCy('execution-environment-select-form-group').within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.filterTableBySingleSelect('name', executionEnvironment.name);
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click();
          });
          cy.clickButton(/^Confirm/);
        });
        cy.clickButton(/^Next$/);
        cy.getByDataCy('credential-select-form-group').within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.selectItemFromLookupModal('credential-select', machineCredential.name);
        cy.clickButton(/^Next$/);
        cy.getByDataCy('module').should('contain', 'shell');
        cy.getByDataCy('arguments').should('contain', 'argument');
        cy.getByDataCy('verbosity').should('contain', '1');
        cy.getByDataCy('limit').should('contain', 'limit');
        cy.getByDataCy('forks').should('contain', '1');
        cy.getByDataCy('show-changes').should('contain', 'On');
        cy.getByDataCy('privilege-escalation').should('contain', 'On');
        cy.getByDataCy('credentials').should('contain', machineCredential.name);
        cy.getByDataCy('execution-environment').should('contain', executionEnvironment.name);
        cy.get('[data-cy="Submit"]').click();
        cy.verifyPageTitle('shell');
        cy.url().then((currentUrl) => {
          expect(currentUrl.includes('/jobs/command/')).to.be.true;
          expect(currentUrl.includes('output')).to.be.true;
        });
        cy.getByDataCy('Output').should('exist');
        cy.clickTab(/^Details$/, true);
        cy.getByDataCy('type').should('contain', 'Command');
        cy.getByDataCy('inventory').should('contain', inventory.name);
        cy.getByDataCy('inventory').within(() => {
          cy.get('a').click();
        });
        cy.verifyPageTitle(inventory.name);
        cy.url().then((currentUrl) => {
          expect(currentUrl.includes(`/infrastructure/inventories/inventory/${inventory.id}/`)).to
            .be.true;
        });
        cy.clickTab(/^Jobs$/, true);
        cy.clickTableRowLink('name', 'shell', { disableFilter: true });
        cy.getByDataCy('inventory').should('contain', inventory.name);
      });
    });

    it('can bulk delete groups from the group list view', () => {
      const arrayOfElementText: string[] = [];
      cy.createAwxInventory().then((inv) => {
        inventory = inv;

        for (let i = 0; i < 5; i++) {
          const groupName = generateGroupName();
          cy.createInventoryGroup(inventory, groupName);
          arrayOfElementText.push(groupName);
        }
        cy.navigateTo('awx', 'inventories');
        cy.verifyPageTitle('Inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.clickTab(/^Groups$/, true);
        cy.get('tbody tr').should('have.length', 5);
        cy.getByDataCy('select-all').click();
        cy.intercept('DELETE', awxAPI`/groups/*/`).as('deleted');
        cy.clickToolbarKebabAction('delete-selected-groups');
        cy.getModal().within(() => {
          cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
          cy.get('[data-cy="delete-group-modal-delete-button"]').click();
        });

        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
        cy.getModal().should('not.exist');
        cy.verifyPageTitle(inventory.name);
        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });
  });

  describe('Inventory Groups - Details View', () => {
    it('can create a group, assert info on details page, then delete group from the details page', () => {
      cy.createAwxInventory().then((inv) => {
        inventory = inv;
        const newGroupName = 'E2E Group ' + randomString(4);
        cy.intercept('POST', awxAPI`/groups/`).as('createGroup');
        cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/groups?`);
        cy.clickButton(/^Create group$/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name"]').type(newGroupName);
        cy.get('[data-cy="description"]').type('This is a description');
        cy.dataEditorTypeByDataCy('variables', 'test: true');
        cy.clickButton(/^Save/);
        cy.wait('@createGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(201);
          });
        cy.hasDetail(/^Name$/, newGroupName);
        cy.hasDetail(/^Description$/, 'This is a description');
        cy.hasDetail(/^Variables$/, 'test: true');
        cy.intercept('DELETE', awxAPI`/groups/*/`).as('deleted');
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('[data-cy="delete-group"]').click();
        cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
        cy.get('[data-cy="delete-group-modal-delete-button"]').click();
        cy.getByDataCy('empty-state-title').should(
          'contain',
          'There are currently no groups added to this inventory.'
        );
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can edit an inventory group from the group details view', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;

        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.get(`[href*="/infrastructure/inventories/inventory/${inventory.id}/hosts?"]`).click();
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickTab(/^Groups$/, true);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.intercept('PATCH', awxAPI`/groups/*/`).as('editGroup');
        cy.get('[data-cy="edit-group"]').click();
        cy.verifyPageTitle('Edit group');
        cy.get('[data-cy="name-form-group"]').type('-changed');
        cy.get('[data-cy="Submit"]').click();
        cy.wait('@editGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(200);
          });
        cy.verifyPageTitle(group.name + '-changed');
        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });
  });

  describe('Inventory Groups - Related Groups Tab', () => {
    it('can add and disassociate new related groups', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;
        const newRelatedGroup = 'New test group' + randomString(4);

        cy.navigateTo('awx', 'inventories');
        cy.verifyPageTitle('Inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickTab(/^Hosts$/, true);
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickTab(/^Groups$/, true);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.clickTab(/^Related Groups$/, true);
        cy.clickButton(/^New group/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name-form-group"]').type(newRelatedGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.contains(newRelatedGroup);
        cy.filterTableByMultiSelect('name', [newRelatedGroup]);
        cy.selectTableRow(newRelatedGroup, false);
        cy.intercept('POST', awxAPI`/groups/*/children/`).as('disassociateGroup');
        cy.clickToolbarKebabAction('disassociate-selected-groups');
        cy.clickModalConfirmCheckbox();
        cy.clickButton(/^Disassociate groups/);
        cy.wait('@disassociateGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(204);
          });
        cy.assertModalSuccess();
        cy.clickModalButton(/^Close/);
        cy.clickButton(/^Clear all filters$/);

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can add, edit and then disassociate existing related groups', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;
        const newGroup = 'New test group' + randomString(4);

        cy.navigateTo('awx', 'inventories');
        cy.verifyPageTitle('Inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickTab(/^Hosts$/, true);
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickTab(/^Groups$/, true);
        cy.clickButton(/^Create group/);
        cy.get('[data-cy="name-form-group"]').type(newGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.clickTab(/^Back to Groups$/, true);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.clickTab(/^Related Groups$/, true);
        cy.clickButton(/^Existing group/);
        cy.filterTableByMultiSelect('name', [newGroup]);
        cy.selectTableRow(newGroup, false);
        cy.clickButton(/^Add groups/);
        cy.contains(newGroup);
        cy.clickTableRowAction('name', newGroup, 'edit-group', {
          inKebab: false,
          disableFilter: true,
        });
        cy.intercept('PATCH', awxAPI`/groups/*/`).as('editGroup');
        cy.verifyPageTitle('Edit group');
        cy.get('[data-cy="name-form-group"]').type('-changed');
        cy.get('[data-cy="Submit"]').click();
        cy.wait('@editGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(200);
          });
        cy.verifyPageTitle(newGroup + '-changed');
        cy.clickTab(/^Back to Groups$/, true);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.clickTab(/^Related Groups$/, true);
        cy.selectTableRow(newGroup, false);
        cy.intercept('POST', awxAPI`/groups/*/children/`).as('disassociateGroup');
        cy.clickToolbarKebabAction('disassociate-selected-groups');
        cy.clickModalConfirmCheckbox();
        cy.clickButton(/^Disassociate groups/);
        cy.wait('@disassociateGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(204);
          });
        cy.assertModalSuccess();
        cy.clickModalButton(/^Close/);

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it.skip("can run an ad-hoc command against a group's related group list view", () => {
      // TODO: run command is not currently working for related groups.
      // https://issues.redhat.com/browse/AAP-24634

      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, group } = result;
        const newRelatedGroup = 'New test group' + randomString(4);

        cy.navigateTo('awx', 'inventories');
        cy.verifyPageTitle('Inventories');
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickTab(/^Groups$/, true);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.clickTab(/^Related Groups$/, true);
        cy.clickButton(/^New group/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name-form-group"]').type(newRelatedGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.contains(newRelatedGroup);
        cy.filterTableBySingleSelect('name', newRelatedGroup);
        cy.selectTableRow(newRelatedGroup, false);
        cy.intercept('POST', awxAPI`/groups/*/children/`).as('disassociateGroup');
        cy.clickToolbarKebabAction('run-command');
        cy.clickKebabAction('actions-dropdown', 'run-command');

        cy.selectDropdownOptionByResourceName('module-name', 'shell');

        cy.clickModalConfirmCheckbox();
        cy.clickButton(/^Disassociate groups/);
        cy.wait('@disassociateGroup')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(204);
          });
        cy.assertModalSuccess();
        cy.clickModalButton(/^Close/);
        cy.clickButton(/^Clear all filters$/);

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });
  });

  describe('Inventory Groups - Hosts Tab', () => {
    let thisInventory: Inventory;
    let thisHost: AwxHost;

    beforeEach(() => {
      cy.createInventoryHostGroup(organization).then(({ inventory, host }) => {
        thisInventory = inventory;
        thisHost = host;
      });
      cy.navigateTo('awx', 'inventories');
      cy.verifyPageTitle('Inventories');
    });

    afterEach(() => {
      cy.deleteAwxInventory(thisInventory, { failOnStatusCode: false });
    });

    it('can add a new host to a group and then delete it', () => {
      const newHostName = 'New test host' + randomString(4);
      cy.filterTableBySingleSelect('name', thisInventory.name);
      cy.clickTableRowLink('name', thisInventory.name, { disableFilter: true });
      cy.verifyPageTitle(thisInventory.name);
      cy.clickTab(/^Hosts$/, true);
      cy.clickTableRowAction('name', thisHost.name, 'delete-host', {
        inKebab: true,
        disableFilter: true,
      });
      cy.intercept('DELETE', awxAPI`/hosts/*/`).as('deleted');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton(/^Delete hosts/);

      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });

      cy.assertModalSuccess();
      cy.clickModalButton(/^Close/);

      cy.intercept('POST', awxAPI`/hosts/`).as('createHost');
      cy.clickButton(/^Create host$/);
      cy.verifyPageTitle('Create Host');
      cy.getByDataCy('name').type(newHostName);
      cy.getByDataCy('description').type('This is the description');
      cy.clickButton(/^Create host$/);
      cy.wait('@createHost')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
      cy.verifyPageTitle('Host Details');
      cy.clickTab(/^Back to Hosts$/, true);
      cy.filterTableBySingleSelect('name', newHostName);
    });

    it('can edit a related host from the host tab', () => {
      cy.filterTableBySingleSelect('name', thisInventory.name);
      cy.clickTableRowLink('name', thisInventory.name, { disableFilter: true });
      cy.verifyPageTitle(thisInventory.name);
      cy.clickTab(/^Hosts$/, true);
      cy.clickTableRowAction('name', thisHost.name, 'edit-host', {
        inKebab: false,
        disableFilter: true,
      });
      cy.intercept('PATCH', awxAPI`/hosts/*/`).as('editHost');
      cy.verifyPageTitle('Edit host');
      cy.getByDataCy('name').type('-edited');
      cy.getByDataCy('description').type('This is the description');
      cy.clickButton(/^Save host$/);

      cy.wait('@editHost')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
        });
      cy.verifyPageTitle('Host Details');
      cy.clickTab(/^Back to Hosts$/, true);
      cy.filterTableBySingleSelect('name', thisHost.name + '-edited');
    });

    it.skip("can run an ad-hoc command against a group's host", () => {
      cy.filterTableBySingleSelect('name', thisInventory.name);
      cy.clickTableRowLink('name', thisInventory.name, { disableFilter: true });
      cy.verifyPageTitle(thisInventory.name);
      cy.clickTab(/^Hosts$/, true);
      cy.clickKebabAction('actions-dropdown', 'run-command');
      cy.selectDropdownOptionByResourceName('module-name', 'shell');
      cy.getByDataCy('module-args-form-group').type('argument');
      cy.selectDropdownOptionByResourceName('verbosity', '1 (Verbose)');
      cy.getByDataCy('limit-form-group').within(() => {
        cy.get('input').clear().type('limit');
      });
      cy.getByDataCy('forks-form-group').within(() => {
        cy.get('input').clear().type('1');
      });
      cy.getByDataCy('diff-mode-form-group').within(() => {
        cy.get('.pf-v5-c-form__group-control > label').click();
      });
      cy.getByDataCy('become_enabled').click();
      cy.clickButton(/^Next$/);
      cy.getByDataCy('execution-environment-select-form-group').within(() => {
        cy.getBy('[aria-label="Options menu"]').click();
      });
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.filterTableBySingleSelect('name', executionEnvironment.name);
        cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
          cy.get('[data-cy="checkbox-column-cell"] input').click();
        });
        cy.clickButton(/^Confirm/);
      });
      cy.clickButton(/^Next$/);
      // TODO: modal is closed instanly, possible cause: https://issues.redhat.com/browse/AAP-23766
      cy.getByDataCy('credential-select-form-group').within(() => {
        cy.getBy('[aria-label="Options menu"]').click();
      });
      cy.get('[data-ouia-component-id="lookup-credential.name-button"]').click();
      cy.getModal().within(() => {
        cy.selectTableRowByCheckbox('name', machineCredential.name);
        cy.clickButton(/^Confirm$/);
      });
      cy.clickButton(/^Next$/);
      cy.getByDataCy('module').should('contain', 'shell');
      cy.getByDataCy('arguments').should('contain', 'argument');
      cy.getByDataCy('verbosity').should('contain', '1');
      cy.getByDataCy('limit').should('contain', 'limit');
      cy.getByDataCy('forks').should('contain', '1');
      cy.getByDataCy('show-changes').should('contain', 'On');
      cy.getByDataCy('privilege-escalation').should('contain', 'On');
      cy.getByDataCy('credentials').should('contain', machineCredential.name);
      cy.getByDataCy('execution-environment').should('contain', executionEnvironment.name);
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle('shell');
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('/jobs/command/')).to.be.true;
        expect(currentUrl.includes('output')).to.be.true;
      });
      cy.getByDataCy('Output').should('exist');
    });
  });
});
