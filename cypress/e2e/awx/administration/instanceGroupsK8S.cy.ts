import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';

describe('Instance Groups: K8S', () => {
  let instance: Instance;
  let instanceGroup: InstanceGroup;
  let instanceGroupDisassociate: InstanceGroup;
  let instanceToAssociate: Instance;
  let isK8S = false;

  before(() => {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      if (data?.IS_K8S) {
        isK8S = true;
      } else {
        cy.log('Skip test not running on IS_K8S');
      }
    });
  });

  beforeEach(() => {
    if (isK8S) {
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
      });
    }
  });

  afterEach(() => {
    if (isK8S) {
      cy.removeAwxInstance(instance?.id.toString());
      cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
    }
  });

  it('can visit the instances tab of an instance group and associate an instance to that instance group, then disable the instance', () => {
    if (!isK8S) {
      cy.log('Skip test not running on IS_K8S');
      return;
    }
    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');
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
    if (!isK8S) {
      cy.log('Skip test not running on IS_K8S');
      return;
    }
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
      cy.navigateTo('awx', 'instance-groups');
      cy.verifyPageTitle('Instance Groups');
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
    if (!isK8S) {
      cy.log('Skip test not running on IS_K8S');
      return;
    }
    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');
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
    if (!isK8S) {
      cy.log('Skip test not running on IS_K8S');
      return;
    }
    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');
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
    if (!isK8S) {
      cy.log('Skip test not running on IS_K8S');
      return;
    }
    cy.navigateTo('awx', 'instance-groups');
    cy.verifyPageTitle('Instance Groups');
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
