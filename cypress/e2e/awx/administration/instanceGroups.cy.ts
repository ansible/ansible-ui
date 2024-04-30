import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';

describe('Instance Groups', () => {
  let instanceGroup: InstanceGroup;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstanceGroup().then((ig: InstanceGroup) => {
      instanceGroup = ig;
    });
  });

  afterEach(() => {
    cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
  });

  describe('Instance Groups: List View', () => {
    it('can create new Instance Group, enable the instance, assert info on details page, then delete the instance group', () => {
      const name = 'E2E Instance Group' + randomString(4);
      cy.navigateTo('awx', 'instance-groups');
      cy.clickButton(/^Create group$/);
      cy.clickLink(/^Create instance group$/);
      cy.get('[data-cy="name"]').type(name);

      cy.get('[data-cy="policy-instance-minimum"]').clear();
      cy.get('[data-cy="policy-instance-minimum"]').type('1');

      cy.get('[data-cy="policy-instance-percentage"]').clear();
      cy.get('[data-cy="policy-instance-percentage"]').type('2');

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');
      cy.clickButton(/^Create Instance Group$/);
      cy.verifyPageTitle(name);
    });

    it('can edit Instance Group and assert the edited info', () => {
      cy.navigateTo('awx', 'instance-groups');
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.clickTableRowKebabAction(instanceGroup.name, 'edit-instance-group', false);
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type(`${instanceGroup.name}- edited`);

      cy.get('[data-cy="policy-instance-minimum"]').clear();
      cy.get('[data-cy="policy-instance-minimum"]').type('1');

      cy.get('[data-cy="policy-instance-percentage"]').clear();
      cy.get('[data-cy="policy-instance-percentage"]').type('2');

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');

      cy.clickButton(/^Save Instance Group$/);
      cy.verifyPageTitle(`${instanceGroup.name}- edited`);
    });

    it('can delete Instance Group and assert the deletion', () => {
      //Add more robust assertions to this test- specifically with regard to deletion
      //Change this test to utilize the IG created in the beforeEach block
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

    it.skip('can bulk delete Instance Groups and assert the deletion', () => {
      //Utilize the IG created in the beforeEach block
      //Create 1 or 2 additional IGs in this test in order to have multiples to delete
      //Assert the deletion of the IGs
    });

    it('bulk deletion dialog shows warnings for instance groups that cannot be deleted', () => {
      cy.navigateTo('awx', 'instance-groups');
      cy.get('#select-all').click();
      cy.clickToolbarKebabAction('delete-selected-instance-groups');
      cy.contains(
        'of the selected instance groups cannot be deleted due to insufficient permission.'
      ).should('be.visible');
      cy.contains(
        'Deleting instance groups could impact other resources that rely on them.'
      ).should('be.visible');
      cy.contains('button', 'Cancel').click();
      cy.get('input[data-cy=select-all]').click();
      //Add final assertion here
    });
  });

  describe('Instance Groups: Details View', () => {
    it.skip('can edit Instance Group from the details page and assert edited info', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the Edit button on the details page
      //Assert the edited info of the IG
    });

    it.skip('can delete Instance Group and assert the deletion', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the Delete button on the details page
      //Assert the deletion
    });
  });

  describe('Instance Groups: Instances Tab', () => {
    //Add a before block here to create an Instance
    //Add an after block here to delete that Instance

    it.skip('can visit the instances tab of an instance group and associate an instance to that instance group, then disable the instance', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances tab
      //Assert the association of the Instance to the IG
      //Assert the Instance being disabled
    });

    it.skip('can visit the instances tab of an instance group and disassociate an instance from that instance group', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances tab
      //Assert the disassociation of the instance from the IG
    });

    it.skip('can visit the instances tab of an instance group and bulk disassociate multiple instances from that instance group', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances tab
      //Create one additional instance in this test to allow for bulk deletion
      //Assert the deletion
    });

    it.skip('can visit the instances tab of an instance group and run a health check against an instance', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances tab
      //Assert the presence of the health check button
      //After running the health check, assert the expected UI behavior/results
    });
  });

  describe('Instance Groups: Instances Tab -> Instances Details Page', () => {
    //Add a before block here to create an Instance
    //Add an after block here to delete that Instance

    it.skip('can visit the details page of an instance nested inside an instance group and run health check on it', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> details tab
      //Assert the presence of the health check button
      //After running the health check, assert the expected UI behavior/results
    });

    it.skip('can visit the details page of an instance nested inside an instance group and disassociate the instance from the IG', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> details tab
      //Assert the disassociation of the instance from the IG
    });

    it.skip('can visit the details page of an instance nested inside an instance group and change the capacity adjustment and disable the instance', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> details tab
      //Assert presence of capacity adjustment bar and its original setting
      //Assert edited setting of capacity adjustment bar
      //Disable the instance and assert the disablement
    });
  });

  describe('Instance Groups: Jobs Tab', () => {
    //Add a beforeEach block and use it to create a job template utilizing the IG created in the original beforeEach block
    //Add a command to trigger the launch of the job template
    //Add an afterEach block to delete the job template

    it.skip('can visit the instance group -> jobs tab, trigger a job, let the job finish, then view the job on the jobs list tab of the IG', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> jobs tab
      //Assert the expected job in the list
    });

    it.skip('can visit the instance group -> jobs tab and relaunch a job and then immediately cancel that job associated with that instance group', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> jobs tab
      //Assert the presence of the relaunch button
      //Assert the relaunch trigger
      //Assert the cancellation of the job launch
    });

    it.skip('can visit the instance group -> jobs tab and delete a job associated with that instance group', () => {
      //Utilize the IG created in the beforeEach block
      //Assert the navigation to the instances -> jobs tab
      //Assert the presence of the delete button
      //Assert the deletion of the job
    });
  });
});
