import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Execution Environments', () => {
  let credential: Credential;
  let user: AwxUser;
  let execEnvName: string;
  let image: string;
  let project: Project;
  let awxOrganization: Organization;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Execution Environments: Create', () => {
    beforeEach(() => {
      cy.createAWXCredential({
        name: 'E2E Credential registry' + randomString(4),
        kind: 'registry',
        organization: awxOrganization.id,
        credential_type: 18,
      }).then((cred) => {
        credential = cred;

        cy.createAwxUser({ organization: awxOrganization.id }).then((testUser) => {
          user = testUser;
        });
        execEnvName = 'E2E Execution Environment Create' + randomString(4);
        image = 'quay.io/ansible/awx-ee:latest';
      });
      cy.navigateTo('awx', 'execution-environments');
      cy.verifyPageTitle('Execution Environments');
    });

    afterEach(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
      cy.deleteAwxUser(user, { failOnStatusCode: false });
    });

    it('can create a new EE associated to a particular org, assert info on details page, then navigate to EE list and delete the EE', () => {
      cy.getByDataCy('create-execution-environment').click();
      cy.getByDataCy('name').type(execEnvName);
      cy.getByDataCy('image').type(image);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.selectSingleSelectOption('[data-cy="credential"]', credential.name);
      cy.intercept('POST', awxAPI`/execution_environments/`).as('createEE');
      cy.clickButton(/^Create execution environment$/);
      cy.wait('@createEE')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((response: ExecutionEnvironment) => {
          cy.hasDetail('Name', execEnvName);
          cy.hasDetail('Image', image);
          cy.hasDetail('Organization', awxOrganization.name);
          cy.hasDetail('Registry Credential', credential.name);
          cy.url().then((currentUrl) => {
            expect(
              currentUrl.includes(
                `/infrastructure/execution-environments/${response.id.toString()}/details`
              )
            ).to.be.true;
          });
        });
      cy.clickTab(/^Back to Execution Environments$/, true);
      cy.verifyPageTitle('Execution Environments');
      cy.filterTableBySingleSelect('name', execEnvName);
      cy.clickTableRowKebabAction(execEnvName, 'delete-execution-environment', false);
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/execution_environments/*/`).as('deleteEE');
      cy.clickModalButton('Delete execution environments');
      cy.wait('@deleteEE')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.getModal().within(() => {
        cy.contains('Permanently delete execution environments');
        cy.contains(execEnvName);
      });
      cy.assertModalSuccess();
      cy.clickModalButton('Close');
    });

    it('can create a new EE associated to a particular org, then visit the EE tab inside the org to view the EE and assert info', () => {
      cy.getByDataCy('create-execution-environment').click();
      cy.getByDataCy('name').type(execEnvName);
      cy.getByDataCy('image').type(image);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.selectSingleSelectOption('[data-cy="credential"]', credential.name);
      cy.intercept('POST', awxAPI`/execution_environments/`).as('createEE');
      cy.clickButton(/^Create execution environment$/);
      cy.wait('@createEE')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((response: ExecutionEnvironment) => {
          cy.hasDetail('Name', execEnvName);
          cy.hasDetail('Image', image);
          cy.hasDetail('Organization', awxOrganization.name);
          cy.hasDetail('Registry Credential', credential.name);
          cy.url().then((currentUrl) => {
            expect(
              currentUrl.includes(
                `/infrastructure/execution-environments/${response.id.toString()}/details`
              )
            ).to.be.true;
          });
        });
      cy.clickLink(awxOrganization.name);
      cy.verifyPageTitle(awxOrganization.name);
      cy.url().then((currentUrl) => {
        expect(
          currentUrl.includes(`/access/organizations/${awxOrganization.id.toString()}/details`)
        ).to.be.true;
      });
      cy.clickTab(/^Execution environments$/, true);
      cy.filterTableBySingleSelect('name', execEnvName);
      cy.clickTableRowKebabAction(execEnvName, 'delete-execution-environment', false);
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/execution_environments/*/`).as('deleteEE');
      cy.clickModalButton('Delete execution environments');
      cy.wait('@deleteEE')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.getModal().within(() => {
        cy.contains('Permanently delete execution environments');
        cy.contains(execEnvName);
      });
      cy.assertModalSuccess();
      cy.clickModalButton('Close');
    });

    it.skip('can create a new EE associated to a particular org, assign admin access to a user in that org, and login as that user to assert access to the EE', () => {
      cy.getByDataCy('create-execution-environment').click();
      cy.getByDataCy('name').type(execEnvName);
      cy.getByDataCy('image').type(image);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.clickButton(/^Create execution environment$/);
      cy.hasDetail('Name', execEnvName);
      cy.hasDetail('Image', image);
      cy.hasDetail('Organization', awxOrganization.name);
      cy.navigateTo('awx', 'execution-environments');
      cy.verifyPageTitle('Execution Environments');
      cy.awxLoginTestUser(user.username, 'pw');
      cy.navigateTo('awx', 'execution-environments');
      cy.verifyPageTitle('Execution Environments');
      cy.filterTableBySingleSelect('name', execEnvName);
      cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
      cy.hasDetail('Name', execEnvName);
      cy.hasDetail('Image', image);
      cy.hasDetail('Organization', awxOrganization.name);
      cy.getByDataCy('actions-dropdown')
        .click()
        .then(() => {
          cy.get('[data-cy="delete-execution-environment"]').should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
    });
  });

  describe('Execution Environments: Edit and Bulk delete', () => {
    let executionEnvironment: ExecutionEnvironment;
    const testSignature: string = randomString(5, undefined, { isLowercase: true });
    function generateExecEnvName(): string {
      return `test-${testSignature}-ExecEnv-${randomString(5, undefined, { isLowercase: true })}`;
    }

    beforeEach(() => {
      cy.createAwxExecutionEnvironment({
        organization: awxOrganization.id,
      }).then((ee) => {
        executionEnvironment = ee;
      });

      cy.navigateTo('awx', 'execution-environments');
      cy.verifyPageTitle('Execution Environments');
    });

    afterEach(() => {
      cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    });

    it('can edit an EE from the details view and assert edited information on details page', () => {
      cy.filterTableBySingleSelect('name', executionEnvironment.name);
      cy.clickTableRowLink('name', executionEnvironment.name, { disableFilter: true });
      cy.verifyPageTitle(executionEnvironment.name);
      cy.getByDataCy('edit-execution-environment').click();
      cy.verifyPageTitle('Edit Execution Environment');
      cy.url().then((currentUrl) => {
        expect(
          currentUrl.includes(
            `/infrastructure/execution-environments/${executionEnvironment.id.toString()}/edit`
          )
        ).to.be.true;
      });
      cy.intercept(
        'PATCH',
        awxAPI`/execution_environments/${executionEnvironment.id.toString()}/`
      ).as('editEE');
      cy.getByDataCy('name').type('-edited');
      cy.getByDataCy('Submit').click();
      cy.wait('@editEE')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(200);
        });
      cy.verifyPageTitle(executionEnvironment.name + '-edited');
      cy.hasDetail('Name', executionEnvironment.name + '-edited');
      cy.hasDetail('Image', 'executionenvimage');
      cy.hasDetail('Organization', awxOrganization.name);
    });

    it('can edit an EE from the list view and assert edited information', () => {
      cy.filterTableBySingleSelect('name', executionEnvironment.name);
      cy.clickTableRowAction('name', executionEnvironment.name, 'edit-execution-environment', {
        inKebab: false,
        disableFilter: true,
      });
      cy.verifyPageTitle('Edit Execution Environment');
      cy.url().then((currentUrl) => {
        expect(
          currentUrl.includes(
            `/infrastructure/execution-environments/${executionEnvironment.id.toString()}/edit`
          )
        ).to.be.true;
      });
      cy.intercept(
        'PATCH',
        awxAPI`/execution_environments/${executionEnvironment.id.toString()}/`
      ).as('editEE');
      cy.getByDataCy('name').type('-edited');
      cy.getByDataCy('Submit').click();
      cy.wait('@editEE')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(200);
        });
      cy.verifyPageTitle(executionEnvironment.name + '-edited');
      cy.hasDetail('Name', executionEnvironment.name + '-edited');
      cy.hasDetail('Image', 'executionenvimage');
      cy.hasDetail('Organization', awxOrganization.name);
    });

    it('can bulk delete multiple EEs from the list view and assert deletion', () => {
      const arrayOfElementText: string[] = [];
      for (let i = 0; i < 5; i++) {
        const execEnvName = generateExecEnvName();
        cy.createAwxExecutionEnvironment({
          organization: awxOrganization.id,
          name: execEnvName,
        });
        arrayOfElementText.push(execEnvName);
      }
      cy.filterTableByMultiSelect('name', arrayOfElementText);
      cy.get('tbody tr').should('have.length', 5);
      cy.getByDataCy('select-all').click();
      cy.clickToolbarKebabAction('delete-selected-execution-environments');
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/execution_environments/*/`).as('deleteEE');
      cy.clickModalButton('Delete execution environments');
      cy.wait('@deleteEE')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.getModal().within(() => {
        cy.contains('Permanently delete execution environments');
        cy.contains(arrayOfElementText[0]);
        cy.contains(arrayOfElementText[1]);
      });
      cy.assertModalSuccess();
      cy.clickModalButton('Close');
    });
  });

  describe('Execution Environments: Templates View', () => {
    let inventory: Inventory;

    beforeEach(() => {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;
      });
      cy.navigateTo('awx', 'execution-environments');
      cy.verifyPageTitle('Execution Environments');
    });

    afterEach(() => {
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it.skip('can create a new JT using the existing EE, visit the templates tab of the EE to view the JT, delete the JT and then delete the EE', function () {
      const jtName = 'E2E Job Template EE ' + randomString(4);
      const execEnvName = 'E2E Execution Environment JT ' + randomString(4);
      const image = 'quay.io/ansible/awx-ee:latest';
      cy.getByDataCy('create-execution-environment').click();
      cy.getByDataCy('name').type(execEnvName);
      cy.getByDataCy('image').type(image);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.intercept('POST', awxAPI`/execution_environments/`).as('createEE');
      cy.clickButton(/^Create execution environment$/);
      cy.wait('@createEE')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((response: ExecutionEnvironment) => {
          cy.hasDetail('Name', execEnvName);
          cy.hasDetail('Image', image);
          cy.hasDetail('Organization', awxOrganization.name);
          cy.url().then((currentUrl) => {
            expect(
              currentUrl.includes(
                `/infrastructure/execution-environments/${response.id.toString()}/details`
              )
            ).to.be.true;
          });
        });
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.getByDataCy('create-template').click();
      cy.clickLink(/^Create job template$/);
      cy.getByDataCy('name').type(jtName);
      cy.selectDropdownOptionByResourceName('inventory', inventory.name);
      cy.selectDropdownOptionByResourceName('project', `${project.name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.singleSelectBy('[data-cy="executionEnvironment"]', execEnvName);
      cy.intercept('POST', awxAPI`/job_templates/`).as('createJT');
      cy.getByDataCy('Submit').click();
      cy.wait('@createJT')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
      cy.verifyPageTitle(jtName);
      cy.getByDataCy('name').should('contain', jtName);
      cy.getByDataCy('inventory').should('contain', inventory.name);
      cy.getByDataCy('execution-environment').should('contain', execEnvName);
      cy.clickLink(execEnvName);
      cy.verifyPageTitle(execEnvName);
      cy.getByDataCy('name').should('contain', execEnvName);
      cy.getByDataCy('image').should('contain', image);
      cy.clickTab(/^Templates$/, true);
      cy.filterTableBySingleSelect('name', jtName);
      cy.clickTableRowKebabAction(jtName, 'delete-template', false);
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/job_templates/*/`).as('deleteJT');
      cy.clickModalButton('Delete template');
      cy.wait('@deleteJT')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.getModal().within(() => {
        cy.contains('Permanently delete job template');
        cy.contains(jtName);
      });
      cy.assertModalSuccess();
      cy.clickModalButton('Close');
      cy.clickTab(/^Details$/, true);
      cy.getByDataCy('actions-dropdown')
        .click()
        .then(() => {
          cy.getByDataCy('delete-execution-environment').click();
        });
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/execution_environments/*/`).as('deleteEE');
      cy.clickModalButton('Delete execution environments');
      cy.wait('@deleteEE')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });
});

describe('Execution Environments: User/Team access', () => {
  let organization: Organization;
  let user: AwxUser;
  let team: Team;
  let execEnv: ExecutionEnvironment;
  const execEnvName = 'E2E Execution Environment Create' + randomString(4);
  const image = 'quay.io/ansible/awx-ee:latest';

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
      cy.createAwxTeam({ organization: organization.id }).then((testTeam) => {
        team = testTeam;
      });
      cy.createAwxExecutionEnvironment({
        name: execEnvName,
        organization: organization.id,
        image: image,
      }).then((createdEE) => {
        execEnv = createdEE;
      });
    });
  });

  after(() => {
    cy.deleteAwxExecutionEnvironment(execEnv, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('Add a user role assignment from the User Access tab', () => {
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', awxAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.filterTableByMultiSelect('name', [execEnvName]);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnv.name);
    cy.clickTab(/^User Access$/, true);

    cy.getByDataCy('add-roles').click();
    cy.verifyPageTitle('Add roles');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select user(s)').should('be.visible');
      cy.selectTableRowByCheckbox('username', user.username);
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Select roles to apply').should('be.visible');
      cy.filterTableByTextFilter('name', 'ExecutionEnvironment Admin', {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', 'ExecutionEnvironment Admin', {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Review').should('be.visible');
      cy.verifyReviewStepWizardDetails('users', [user.username], '1');
      cy.verifyReviewStepWizardDetails(
        'awxRoles',
        ['ExecutionEnvironment Admin', 'Has all permissions to a single execution environment'],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@userRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().within(() => {
      cy.clickButton(/^Close$/);
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);

    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('remove-selected-roles');
    cy.contains('Remove role');
    cy.clickModalConfirmCheckbox();
    cy.clickButton(/^Remove role$/);
    cy.clickButton(/^Close$/);
  });

  it.skip('Add a team role assignment from the Team Access tab', () => {
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', awxAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.filterTableByMultiSelect('name', [execEnvName]);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnvName);
    cy.clickTab(/^Team Access$/, true);

    cy.getByDataCy('add-roles').click();
    cy.verifyPageTitle('Add roles');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select team(s)').should('be.visible');
      cy.filterTableByMultiSelect('name', [team.name]);
      cy.selectTableRowByCheckbox('name', team.name, { disableFilter: true });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Select roles to apply').should('be.visible');
      cy.filterTableByTextFilter('name', 'ExecutionEnvironment Admin', {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', 'ExecutionEnvironment Admin', {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Review').should('be.visible');
      cy.verifyReviewStepWizardDetails('teams', [team.name], '1');
      cy.verifyReviewStepWizardDetails(
        'awxRoles',
        ['ExecutionEnvironment Admin', 'Has all permissions to a single execution environment'],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@teamRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().within(() => {
      cy.clickButton(/^Close$/);
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);

    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('remove-selected-roles');
    cy.contains('Remove role');
    cy.clickModalConfirmCheckbox();
    cy.clickButton(/^Remove role$/);
    cy.clickButton(/^Close$/);
  });

  it('User and Team Access tabs are not present for managed EEs', () => {
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.clickTableRowLink('name', 'Control Plane Execution Environment', { disableFilter: true });
    cy.verifyPageTitle('Control Plane Execution Environment');
    cy.contains('a[role="tab"]', 'User Access').should('not.exist');
    cy.contains('a[role="tab"]', 'Team Access').should('not.exist');
  });
});
