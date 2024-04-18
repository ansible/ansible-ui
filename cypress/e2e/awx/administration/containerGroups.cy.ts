import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
//Currently there is no separate interface that exists for Container Groups- there is only one for Instance Groups.
//Need to confirm whether we use the interface for Instance Groups as the interface for a Container Group.

describe('Container Groups', () => {
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

  describe('Container Groups: List View', () => {
    it.skip('can create new Container Group, assert info on details page, then delete the container group', () => {
      //Assert navigation to Container Group list
      //Assert redirect to details page after creations
      //Assert info displayed on details page
      //Assert deletion of the Container Group
      //Delete the Container Group created in this test
    });

    it.skip('can edit Container Group and assert the edited info', () => {
      //Utilize the Container Group created in the beforeEach block
      //Assert original info of the Container Group
      //After edit, assert the edited info of the Container Group
    });

    it.skip('can delete Container Group and assert the deletion', () => {
      //Utilize the Container Group created in the beforeEach block
      //Assert the deletion of the container group
    });

    it.skip('can bulk delete Container Groups and assert the deletion', () => {
      //Utilize the Container Group created in the beforeEach block
      //Create 1 or 2 additional Container Groups in this test in order to have multiples to delete
      //Assert the deletion of the Container Groups
    });
  });

  describe('Container Groups: Details View', () => {
    it.skip('can edit Container Group from the details page and assert edited info', () => {
      //Utilize the Container Group created in the beforeEach block
      //Assert the navigation to the Edit button on the details page
      //Assert the edited info of the IG
    });

    it.skip('can delete Container Group and assert the deletion', () => {
      //Utilize the Container Group created in the beforeEach block
      //Assert the navigation to the Delete button on the details page
      //Assert the deletion
    });
  });

  describe('Container Groups: Jobs Tab', () => {
    //Add a beforeEach block and use it to create a job template utilizing the IG created in the original beforeEach block
    //Add a command to trigger the launch of the job template
    //Add an afterEach block to delete the job template

    it.skip('can visit the Container group -> jobs tab, trigger a job, let the job finish, then view the job on the jobs list tab of the Container group', () => {
      //Utilize the Container group created in the beforeEach block
      //Assert the navigation to the container group -> jobs tab
      //Assert the expected job in the list
    });

    it.skip('can visit the Container group -> jobs tab and relaunch a job associated with that Container group', () => {
      //Utilize the Container group created in the beforeEach block
      //Assert the navigation to the container group -> jobs tab
      //Assert the presence of the relaunch button
      //Assert the relaunch trigger
      //Assert the cancellation of the job launch
    });

    it.skip('can visit the Container group -> jobs tab and delete a job associated with that Container group', () => {
      //Utilize the container group created in the beforeEach block
      //Assert the navigation to the container group -> jobs tab
      //Assert the presence of the delete button
      //Assert the deletion of the job
    });
  });
});
