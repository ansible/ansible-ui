import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';

describe('Instance Groups', () => {
  let instanceGroup: InstanceGroup;

  before(() => {
    cy.awxLogin();

    cy.createAwxInstanceGroup().then((ig: InstanceGroup) => {
      instanceGroup = ig;
    });
  });

  after(() => {
    cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
  });

  it('render the instance groups list page', () => {
    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');
  });

  it('navigate to the details page for an instance group', () => {
    cy.navigateTo('awx', 'instance-groups');
    cy.filterTableBySingleSelect('name', instanceGroup.name);
    cy.clickTableRowLink('name', instanceGroup.name, { disableFilter: true });
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
    });
  });

  it('delete an instance group from the list row action', () => {
    cy.createAwxInstanceGroup().then((instanceGroup: InstanceGroup) => {
      cy.navigateTo('awx', 'instance-groups');
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.clickTableRowKebabAction(instanceGroup.name, 'delete-instance-group', false);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete instance group/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('bulk deletion dialog shows warnings for instance groups that cannot be deleted', () => {
    cy.navigateTo('awx', 'instance-groups');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction('delete-selected-instance-groups');
    cy.contains(
      'of the selected instance groups cannot be deleted due to insufficient permission.'
    ).should('be.visible');
    cy.contains('Deleting instance groups could impact other resources that rely on them.').should(
      'be.visible'
    );
    cy.contains('button', 'Cancel').click();
    cy.get('input[data-cy=select-all]').click();
  });
});
