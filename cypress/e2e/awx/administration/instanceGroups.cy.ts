import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

const instanceGroupTypes = ['Instance', 'Container'];
instanceGroupTypes.forEach((igType) => {
  describe(`${igType} Groups: List view`, () => {
    let instanceGroup: InstanceGroup;
    const testSignature: string = randomString(5, undefined, { isLowercase: true });
    function generateInstanceGroupName(): string {
      return `test-${testSignature}-${igType.toLowerCase()}-group-${randomString(5, undefined, { isLowercase: true })}`;
    }

    beforeEach(() => {
      cy.createAwxInstanceGroup(
        igType === 'Container'
          ? {
              name: 'E2E Container Group ' + randomString(4),
              is_container_group: true,
              max_concurrent_jobs: 0,
              max_forks: 0,
              pod_spec_override: '',
            }
          : {
              name: 'E2E Instance Group ' + randomString(4),
              percent_capacity_remaining: 100,
              policy_instance_minimum: 0,
            }
      ).then((ig: InstanceGroup) => {
        instanceGroup = ig;
      });
      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
    });

    afterEach(() => {
      cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
    });

    it(`can create new ${igType} Group, assert info on details page and then delete the ${igType.toLowerCase()} group from list view`, () => {
      const name = `E2E ${igType} Group` + randomString(4);
      cy.clickButton(/^Create group$/);
      cy.clickLink(`Create ${igType.toLowerCase()} group`);
      cy.get('[data-cy="name"]').type(name);
      if (igType === 'Instance') {
        cy.get('[data-cy="policy-instance-minimum"]').clear();
        cy.get('[data-cy="policy-instance-minimum"]').type('1');
        cy.get('[data-cy="policy-instance-percentage"]').clear();
        cy.get('[data-cy="policy-instance-percentage"]').type('2%');
      }
      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');
      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');

      cy.intercept('POST', awxAPI`/instance_groups/`).as('createInstanceGroup');
      cy.clickButton(`Create ${igType} Group`);
      cy.wait('@createInstanceGroup')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
      cy.verifyPageTitle(name);
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes(`infrastructure/instance-groups`)).to.be.true;
      });
      if (igType === 'Instance') {
        cy.getByDataCy('policy-instance-minimum').should('have.text', '1');
        cy.getByDataCy('policy-instance-percentage').should('have.text', '2%');
      }
      cy.getByDataCy('max-concurrent-jobs').should('have.text', '3');
      cy.getByDataCy('max-forks').should('have.text', '4');

      cy.clickPageAction(`delete-${igType.toLowerCase()}-group`);
      cy.intercept('DELETE', awxAPI`/instance_groups/*/`).as('deleteInstanceGroup');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains(`Permanently delete ${igType.toLowerCase()} groups`);
        cy.get('button')
          .contains(`Delete ${igType.toLowerCase()} group`)
          .should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('name-column-cell').should('have.text', name);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains(`Delete ${igType.toLowerCase()} group`).click();
      });
      cy.wait('@deleteInstanceGroup')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });

    it(`can edit ${igType} Group from list view and assert the edited info`, () => {
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.clickTableRowKebabAction(instanceGroup.name, `edit-${igType.toLowerCase()}-group`, false);
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type(`${instanceGroup.name}- edited`);

      if (igType === 'Instance') {
        cy.get('[data-cy="policy-instance-minimum"]').clear();
        cy.get('[data-cy="policy-instance-minimum"]').type('1');

        cy.get('[data-cy="policy-instance-percentage"]').clear();
        cy.get('[data-cy="policy-instance-percentage"]').type('2');
      }

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');
      cy.intercept('PATCH', awxAPI`/instance_groups/${instanceGroup.id.toString()}/`).as(
        'editInstanceGroup'
      );

      cy.getByDataCy('Submit').click();
      cy.wait('@editInstanceGroup')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(200);
        })
        .its('response.body')
        .then((response: InstanceGroup) => {
          expect(response.name).contains(instanceGroup.name);
          expect(response.max_concurrent_jobs.toString()).to.equal('3');
          expect(response.max_forks.toString()).to.equal('4');
          if (igType === 'Instance') {
            expect(response?.policy_instance_minimum?.toString()).to.equal('1');
            expect(response?.policy_instance_percentage?.toString()).to.equal('2');
          }
        });
      cy.verifyPageTitle(`${instanceGroup.name}- edited`);
      if (igType === 'Instance') {
        cy.getByDataCy('policy-instance-minimum').should('have.text', '1');
        cy.getByDataCy('policy-instance-percentage').should('have.text', '2%');
      }
      cy.getByDataCy('max-concurrent-jobs').should('have.text', '3');
      cy.getByDataCy('max-forks').should('have.text', '4');
    });

    it(`can bulk delete ${igType} groups from list view and assert the deletion`, () => {
      const arrayOfElementText = [];
      for (let i = 0; i < 5; i++) {
        const instanceGroupName = generateInstanceGroupName();
        cy.createAwxInstanceGroup(
          igType === 'Container'
            ? {
                name: instanceGroupName,
                is_container_group: true,
                max_concurrent_jobs: 0,
                max_forks: 0,
                pod_spec_override: '',
              }
            : {
                name: instanceGroupName,
                percent_capacity_remaining: 100,
                policy_instance_minimum: 100,
              }
        );
        arrayOfElementText.push(instanceGroupName);
      }
      cy.filterTableByMultiSelect('name', arrayOfElementText);
      cy.get('tbody tr').should('have.length', 5);
      cy.getByDataCy('select-all').click();
      cy.clickToolbarKebabAction('delete-selected-instance-groups');
      cy.intercept('DELETE', awxAPI`/instance_groups/*/`).as('deleteInstanceGroup');

      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains(`Permanently delete ${igType.toLowerCase()} groups`);
        cy.get('button')
          .contains(`Delete ${igType.toLowerCase()} group`)
          .should('have.attr', 'aria-disabled', 'true');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains(`Delete ${igType.toLowerCase()} group`).click();
      });
      cy.clickModalButton('Close');
      cy.wait('@deleteInstanceGroup')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });

    it(`bulk deletion dialog shows warnings for ${igType} groups that cannot be deleted`, () => {
      const arrayOfElementText = [instanceGroup.name];
      arrayOfElementText.push(igType === 'Container' ? 'default' : 'controlplane');
      cy.filterTableByMultiSelect('name', arrayOfElementText);
      cy.get('tbody tr').should('have.length', 2);
      cy.get('#select-all').click();
      cy.clickToolbarKebabAction('delete-selected-instance-groups');
      cy.intercept('DELETE', awxAPI`/instance_groups/*/`).as('deleteInstanceGroup');

      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.contains(
          'of the selected instance groups cannot be deleted due to insufficient permission.'
        ).should('be.visible');
        cy.contains(
          'Deleting instance groups could impact other resources that rely on them.'
        ).should('be.visible');
        cy.get('header').contains(`Permanently delete ${igType.toLowerCase()} groups`);
        cy.get('button')
          .contains(`Delete ${igType.toLowerCase()} group`)
          .should('have.attr', 'aria-disabled', 'true');
        cy.get('input[id="confirm"]').click();
        cy.get('button')
          .contains(`Delete ${igType.toLowerCase()} group`)
          .should('have.attr', 'aria-disabled', 'false')
          .click();
      });
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains(`Permanently delete ${igType.toLowerCase()} groups`);
        cy.get('[data-cy="name-column-cell"]').should('have.text', instanceGroup.name);
      });
      cy.assertModalSuccess();
      cy.clickModalButton('Close');
      cy.wait('@deleteInstanceGroup')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });

  describe(`${igType} Groups: Details Tab`, () => {
    let instanceGroup: InstanceGroup;

    beforeEach(() => {
      cy.createAwxInstanceGroup(
        igType === 'Container'
          ? {
              name: 'E2E Container Group ' + randomString(4),
              is_container_group: true,
              max_concurrent_jobs: 0,
              max_forks: 0,
              pod_spec_override: '',
            }
          : {
              name: 'E2E Instance Group ' + randomString(4),
              percent_capacity_remaining: 100,
              policy_instance_minimum: 0,
            }
      ).then((ig: InstanceGroup) => {
        instanceGroup = ig;
      });
      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
    });

    afterEach(() => {
      cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
    });

    it(`can edit ${igType} Group from the details page and assert edited info`, () => {
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.get('[data-cy="name-column-cell"]').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes(`infrastructure/instance-groups`)).to.be.true;
      });
      cy.getByDataCy(`edit-${igType.toLowerCase()}-group`).click();
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type(`${instanceGroup.name}- edited`);

      if (igType === 'Instance') {
        cy.get('[data-cy="policy-instance-minimum"]').clear();
        cy.get('[data-cy="policy-instance-minimum"]').type('1');

        cy.get('[data-cy="policy-instance-percentage"]').clear();
        cy.get('[data-cy="policy-instance-percentage"]').type('2');
      }

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');
      cy.intercept('PATCH', awxAPI`/instance_groups/${instanceGroup.id.toString()}/`).as(
        'editInstanceGroup'
      );
      cy.getByDataCy('Submit').click();
      cy.wait('@editInstanceGroup')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(200);
        })
        .its('response.body')
        .then((response: InstanceGroup) => {
          expect(response.name).contains(instanceGroup.name);
          expect(response.max_concurrent_jobs.toString()).to.equal('3');
          expect(response.max_forks.toString()).to.equal('4');
          if (igType === 'Instance') {
            expect(response?.policy_instance_minimum?.toString()).to.equal('1');
            expect(response?.policy_instance_percentage?.toString()).to.equal('2');
          }
        });
      cy.verifyPageTitle(`${instanceGroup.name}- edited`);
      if (igType === 'Instance') {
        cy.getByDataCy('policy-instance-minimum').should('have.text', '1');
        cy.getByDataCy('policy-instance-percentage').should('have.text', '2%');
      }
      cy.getByDataCy('max-concurrent-jobs').should('have.text', '3');
      cy.getByDataCy('max-forks').should('have.text', '4');
    });

    it(`can delete ${igType} Group from the details page and assert the deletion`, () => {
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.get('[data-cy="name-column-cell"]').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes(`infrastructure/instance-groups`)).to.be.true;
      });
      cy.clickPageAction(`delete-${igType.toLowerCase()}-group`);
      cy.intercept('DELETE', awxAPI`/instance_groups/*/`).as('deleteInstanceGroup');
      cy.get('#confirm').click();
      cy.clickButton(`Delete ${igType.toLowerCase()} group`);
      cy.verifyPageTitle('Instance Groups');
      cy.wait('@deleteInstanceGroup')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });

  describe(`${igType} Groups: Team access Tab`, () => {
    let team: Team;
    let instanceGroup: InstanceGroup;
    let organization: Organization;

    beforeEach(function () {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxTeam({ organization: organization.id }).then((createdTeam) => {
          team = createdTeam;
          cy.createAwxInstanceGroup(
            igType === 'Container'
              ? {
                  name: 'E2E Container Group ' + randomString(4),
                  is_container_group: true,
                  max_concurrent_jobs: 0,
                  max_forks: 0,
                  pod_spec_override: '',
                  credential: null,
                }
              : {
                  name: 'E2E Instance Group ' + randomString(4),
                  policy_instance_minimum: 0,
                  policy_instance_percentage: 0,
                  max_concurrent_jobs: 0,
                  max_forks: 0,
                }
          ).then((ig: InstanceGroup) => {
            instanceGroup = ig;
          });
        });
      });

      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
    });

    afterEach(() => {
      cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it(`can visit the ${igType} group -> team access tab, add a team, view the team on the teams list and then delete team`, () => {
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.get('[data-cy="name-column-cell"]').within(() => {
        cy.get('a').click();
      });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes(`infrastructure/instance-groups`)).to.be.true;
      });
      cy.clickTab(/^Team access$/, true);
      cy.get('.pf-v5-c-empty-state__title-text').contains(
        /^There are currently no teams assigned to this instance group./
      );
      cy.get('.pf-v5-c-empty-state__body').contains(/^Add a role by clicking the button below./);
      cy.getByDataCy('add-roles').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('infrastructure/instance-groups/')).to.be.true;
        expect(currentUrl.includes('instance-groups/teams/add-teams')).to.be.true;
      });
      cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select team(s)');
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
      cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should('have.text', 'Select team(s)');
      cy.filterTableBySingleSelect('name', team.name);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="checkbox-column-cell"] input').click();
      });
      cy.getByDataCy('Submit').click();
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should(
        'have.text',
        'Select roles to apply'
      );
      cy.searchAndDisplayResource('Admin');
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="checkbox-column-cell"] input').click();
      });
      cy.getByDataCy('Submit').click();
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should('have.text', 'Review');
      cy.get('[data-cy="expandable-section-teams"]')
        .should('be.visible')
        .within(() => {
          cy.get('tbody tr').should('have.length', 1);
          cy.get('[data-cy="name-column-cell"]').should('have.text', team.name);
        });
      cy.get('[data-cy="expandable-section-awxRoles"]').should('be.visible');
      cy.intercept('POST', awxAPI`/role_team_assignments/`).as('teamAdded');
      cy.getByDataCy('Submit').click();
      cy.wait('@teamAdded')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
      cy.visit(`/infrastructure/instance-groups/${instanceGroup.id}/team-access`);
      cy.verifyPageTitle(instanceGroup.name);
      cy.get('[data-cy="text-input"]').find('input').type(team.name);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="remove-role"]').click();
      });
      cy.intercept('DELETE', awxAPI`/role_team_assignments/*/`).as('teamRemoved');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Remove role');
        cy.get('button').contains('Remove role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('team-name-column-cell').should('have.text', team.name);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove role').click();
      });
      cy.wait('@teamRemoved')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });

  describe(`${igType} Groups: User access Tab`, () => {
    let user: AwxUser;
    let instanceGroup: InstanceGroup;
    let organization: Organization;

    beforeEach(function () {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxUser({ organization: organization.id }).then((u) => {
          user = u;
          cy.createAwxInstanceGroup(
            igType === 'Container'
              ? {
                  name: 'E2E Container Group ' + randomString(4),
                  is_container_group: true,
                  max_concurrent_jobs: 0,
                  max_forks: 0,
                  pod_spec_override: '',
                }
              : {
                  name: 'E2E Instance Group ' + randomString(4),
                  percent_capacity_remaining: 100,
                  policy_instance_minimum: 0,
                }
          ).then((ig: InstanceGroup) => {
            instanceGroup = ig;
          });
        });
      });

      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
    });

    afterEach(() => {
      cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it(`can visit the ${igType} group -> user access tab, add a user, view the user on the user list and then delete user`, () => {
      cy.filterTableBySingleSelect('name', instanceGroup.name);
      cy.get('[data-cy="name-column-cell"]').within(() => {
        cy.get('a').click();
      });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes(`infrastructure/instance-groups`)).to.be.true;
      });
      cy.clickTab(/^User access$/, true);
      cy.get('.pf-v5-c-empty-state__title-text').contains(
        /^There are currently no users assigned to this instance group./
      );
      cy.get('.pf-v5-c-empty-state__body').contains(/^Add a role by clicking the button below./);
      cy.getByDataCy('add-roles').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('infrastructure/instance-groups/')).to.be.true;
        expect(currentUrl.includes('instance-groups/users/add-users')).to.be.true;
      });
      cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
      cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should('have.text', 'Select user(s)');
      cy.selectTableRowByCheckbox('username', user.username, { disableFilter: false });
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.getByDataCy('Submit').click();
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should(
        'have.text',
        'Select roles to apply'
      );
      cy.searchAndDisplayResource('Admin');
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="checkbox-column-cell"] input').click();
      });
      cy.getByDataCy('Submit').click();
      cy.get('.pf-v5-c-page__main-body > .pf-v5-c-title').should('have.text', 'Review');
      cy.get('[data-cy="expandable-section-users"]')
        .should('be.visible')
        .within(() => {
          cy.get('tbody tr').should('have.length', 1);
          cy.get('[data-cy="username-column-cell"]').should('have.text', user.username);
        });
      cy.get('[data-cy="expandable-section-awxRoles"]').should('be.visible');
      cy.intercept('POST', awxAPI`/role_user_assignments/`).as('userAdded');
      cy.getByDataCy('Submit').click();
      cy.wait('@userAdded')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
      cy.visit(`/infrastructure/instance-groups/${instanceGroup.id}/user-access`);
      cy.verifyPageTitle(instanceGroup.name);
      cy.get('[data-cy="text-input"]').find('input').type(user.username);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="remove-role"]').click();
      });
      cy.intercept('DELETE', awxAPI`/role_user_assignments/*/`).as('userRemoved');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Remove role');
        cy.get('button').contains('Remove role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('username-column-cell').should('have.text', user.username);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove role').click();
      });
      cy.wait('@userRemoved')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });
});

describe('Instance Groups: Jobs Tab', () => {
  let inventory: Inventory;
  let job_template: JobTemplate;
  let instanceGroupDefault: InstanceGroup;
  let organization: Organization;

  beforeEach(function () {
    cy.getAwxInstanceGroupByName('default')
      .its('results[0]')
      .then((ig: InstanceGroup) => {
        instanceGroupDefault = ig;
        cy.createAwxInventory().then((inv) => {
          inventory = inv;
          cy.createAwxOrganization().then((o) => {
            organization = o;
            cy.createAwxJobTemplate(
              {
                organization: organization.id,
                project: (this.globalProject as Project).id,
                inventory: inventory.id,
              },
              'playbooks/hello_world.yml',
              ig
            ).then((result) => {
              job_template = result;
            });
          });
        });
      });
  });

  afterEach(() => {
    cy.deleteAwxJobTemplate(job_template, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('can visit the instance group -> jobs tab, trigger a job, let the job finish, then view the job on the jobs list tab of the IG and delete job', () => {
    cy.navigateTo('awx', 'templates');
    cy.verifyPageTitle('Templates');

    cy.filterTableBySingleSelect('name', job_template.name);
    cy.clickTableRowPinnedAction(job_template.name, 'launch-template', false);
    cy.verifyPageTitle(job_template.name);

    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');

    cy.filterTableBySingleSelect('name', instanceGroupDefault.name);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });
    cy.clickTab(/^Jobs$/, true);
    cy.filterTableBySingleSelect('name', job_template.name);
    cy.intercept('DELETE', awxAPI`/jobs/*/`).as('deleted');

    cy.clickTableRowKebabAction(job_template.name, 'delete-job', false);
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete job');
    cy.assertModalSuccess();
    cy.wait('@deleted')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
      });
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});

describe('Instance Groups: Instances Tab', () => {
  let instance: Instance;
  let instanceGroup: InstanceGroup;

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceIGTest' + randomString(5), 9999).then((ins: Instance) => {
      instance = ins;
      cy.createAwxInstanceGroup({
        name: 'E2E Instance Group Instance tab test' + randomString(4),
        percent_capacity_remaining: 100,
        policy_instance_minimum: 0,
        policy_instance_list: !Cypress.currentTest.title.includes('associate an instance')
          ? [instance.hostname]
          : [],
      }).then((ig: InstanceGroup) => {
        instanceGroup = ig;
      });
      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
    });
  });

  afterEach(() => {
    cy.removeAwxInstance(instance?.id.toString());
    cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
  });

  it('can visit the instances tab of an instance group and associate an instance to that instance group, then disable the instance', () => {
    cy.filterTableBySingleSelect('name', instanceGroup.name);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });

    cy.clickTab(/^Instances$/, true);
    cy.getByDataCy('empty-state-title').contains('There are currently no instances added');
    cy.get('[data-cy="Please associate an instance by using the button below."]').should(
      'be.visible'
    );
    cy.getByDataCy('associate-instance').click();
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Select instances');
      cy.get('button').contains('Confirm').should('have.attr', 'aria-disabled', 'true');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.intercept('POST', awxAPI`/instance_groups/${instanceGroup.id.toString()}/instances/`).as(
        'associateInstance'
      );
      cy.getByDataCy('checkbox-column-cell').find('input').click();
      cy.get('button').contains('Confirm').click();
    });
    cy.assertModalSuccess();
    cy.wait('@associateInstance')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
      });
    cy.clickModalButton('Close');
    cy.intercept('PATCH', awxAPI`/instances/*/`).as('disableInstance');
    cy.getByDataCy('toggle-switch').should('be.visible').click();
    cy.wait('@disableInstance')
      .then((response) => {
        expect(response?.response?.statusCode).to.eql(200);
      })
      .its('response.body.enabled')
      .then((enabled: string) => {
        expect(enabled).to.be.false;
      });
  });

  it('can visit the instances tab of an instance group and bulk disassociate instances from that instance group', () => {
    let instanceGroupDisassociate: InstanceGroup;
    let instanceToAssociate: Instance;
    const arrayOfElementText: string[] = [];
    const arrayOfInstance = <Instance[]>[];
    for (let i = 0; i < 5; i++) {
      cy.createAwxInstance('E2EInstanceToDisassociateFromIG' + randomString(5), 9999).then(
        (ins: Instance) => {
          instanceToAssociate = ins;
          arrayOfElementText.push(instanceToAssociate.hostname);
          arrayOfInstance.push(instanceToAssociate);
        }
      );
    }

    cy.createAwxInstanceGroup({
      name: 'E2E Instance Group Disassociate' + randomString(4),
      percent_capacity_remaining: 100,
      policy_instance_minimum: 0,
      policy_instance_list: arrayOfElementText,
    }).then((ig: InstanceGroup) => {
      instanceGroupDisassociate = ig;
      cy.filterTableBySingleSelect('name', instanceGroupDisassociate?.name);
      cy.get('[data-cy="name-column-cell"]').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
      });
      cy.clickTab(/^Instances$/, true);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 5);
      });
      cy.get('button').contains('Disassociate').should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('select-all').click();
      cy.get('button')
        .contains('Disassociate')
        .should('have.attr', 'aria-disabled', 'false')
        .click();
      cy.intercept(
        'POST',
        awxAPI`/instance_groups/${instanceGroupDisassociate.id.toString()}/instances/`
      ).as('disassociateInstance');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Disassociate instance from instance group');
        cy.get('button')
          .contains('Disassociate instances')
          .should('have.attr', 'aria-disabled', 'true');
        cy.get('input[id="confirm"]').click();
        cy.get('button')
          .contains('Disassociate instances')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
      });
      cy.assertModalSuccess();
      cy.wait('@disassociateInstance')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.clickModalButton('Close');
      cy.getByDataCy('empty-state-title').contains('There are currently no instances added');
      cy.get('[data-cy="Please associate an instance by using the button below."]').should(
        'be.visible'
      );
      cy.deleteAwxInstanceGroup(instanceGroupDisassociate, { failOnStatusCode: false });
      arrayOfInstance.map(({ id }) => cy.removeAwxInstance(id?.toString()));
    });
  });

  it('can visit the instances tab of an instance group and run a health check from toolbar against an instance', () => {
    cy.filterTableBySingleSelect('name', instanceGroup.name);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });
    cy.clickTab(/^Instances$/, true);
    cy.get('button').contains('Run health check').should('have.attr', 'aria-disabled', 'true');
    cy.filterTableBySingleSelect('hostname', instance.hostname);
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.get('tbody tr').should('have.length', 1);
      cy.get('[data-cy="checkbox-column-cell"] input').click();
    });
    cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
      cy.getByDataCy('run-health-check').click();
    });
    cy.intercept('POST', awxAPI`/instances/*/health_check/`).as('runHealthCheck');
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Run health checks on these instances');
      cy.get('button').contains('Run health check').should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Run health check').click();
    });
    cy.assertModalSuccess();
    cy.clickModalButton('Close');
    cy.wait('@runHealthCheck')
      .then((response) => {
        expect(response.response?.statusCode).to.eql(200);
      })
      .its('response.body.msg')
      .then((response) => {
        expect(response).contains(`Health check is running for ${instance.hostname}.`);
      });
  });

  it('can visit the instances tab of an instance group and run a health check from row against an instance', () => {
    cy.filterTableBySingleSelect('name', instanceGroup.name);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });
    cy.clickTab(/^Instances$/, true);
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.get('tbody tr').should('have.length', 1);
    });
    cy.filterTableBySingleSelect('hostname', instance.hostname);
    cy.intercept('POST', awxAPI`/instances/*/health_check/`).as('runHealthCheck');
    cy.clickTableRowPinnedAction(instance.hostname, 'run-health-check', false);
    cy.wait('@runHealthCheck')
      .then((response) => {
        expect(response.response?.statusCode).to.eql(200);
      })
      .its('response.body.msg')
      .then((response) => {
        expect(response).contains(`Health check is running for ${instance.hostname}.`);
      });
  });

  it('can visit the details page of an instance nested inside an instance group and run health check on it', () => {
    cy.filterTableBySingleSelect('name', instanceGroup.name);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });
    cy.clickTab(/^Instances$/, true);
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.get('tbody tr').should('have.length', 1);
    });
    cy.filterTableBySingleSelect('hostname', instance.hostname);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('infrastructure/instance-groups')).to.be.true;
    });
    cy.verifyPageTitle(instance.hostname);
    cy.contains('nav[aria-label="Breadcrumb"]', 'Instance groups').should('exist');
    cy.contains('nav[aria-label="Breadcrumb"]', instanceGroup.name).should('exist');
    cy.contains('nav[aria-label="Breadcrumb"]', 'Instances').should('exist');
    cy.contains('nav[aria-label="Breadcrumb"]', instance.hostname).should('exist');
    cy.contains('nav[aria-label="Breadcrumb"]', 'Details').should('exist');

    cy.intercept('POST', awxAPI`/instances/${instance.id.toString()}/health_check/`).as(
      'runHealthCheck'
    );
    cy.getByDataCy('run-health-check').click();
    cy.wait('@runHealthCheck')
      .then((response) => {
        expect(response.response?.statusCode).to.eql(200);
      })
      .its('response.body.msg')
      .then((response) => {
        expect(response).contains(`Health check is running for ${instance.hostname}.`);
      });
    cy.get('button').contains('Run health check').should('have.attr', 'aria-disabled', 'true');
  });
});
