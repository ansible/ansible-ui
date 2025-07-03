//Tests a user's ability to create, edit, and delete a EVent Stream in the EDA UI.

import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { EdaCredential } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';

describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Event Streams CRUD', () => {
    let edaCredential: EdaCredential;
    let edaOrganization: EdaOrganization;
    const name = 'E2E Event Stream ' + randomString(4);

    before(() => {
      cy.createEdaOrganization().then((org) => {
        edaOrganization = org;
        cy.createBasicEventStreamCredential(org.id).then((credential) => {
          edaCredential = credential;
        });
      });
    });

    after(() => {
      cy.deleteEdaCredential(edaCredential);
      cy.deleteEdaOrganization(edaOrganization);
    });

    it('can create an event stream, and assert the information showing on the details page', () => {
      cy.navigateTo('eda', 'event-streams');
      cy.verifyPageTitle('Event Streams');
      cy.contains('Create event stream').click();
      cy.verifyPageTitle('Create event stream');
      cy.getByDataCy('name').type(name);
      cy.getBy('[data-cy="organization_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaOrganization.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.selectSingleSelectOption('[data-cy="event_stream_type_id"]', 'Basic Event Stream');
      cy.getBy('[data-cy="credential_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaCredential.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.clickButton(/^Create event stream$/);
      cy.verifyPageTitle(name);
      cy.hasDetail('Name', name);
      cy.hasDetail('Event stream type', 'basic');
      cy.hasDetail('URL', 'external_event_stream');
    });

    it('cannot create event stream without mandatory fields', () => {
      const name = 'E2E Event Stream validation check' + randomString(4);
      cy.navigateTo('eda', 'event-streams');
      cy.verifyPageTitle('Event Streams');
      cy.contains('Create event stream').click();
      cy.verifyPageTitle('Create event stream');
      cy.getByDataCy('name').type(name);
      cy.getBy('[data-cy="organization_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaOrganization.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.selectSingleSelectOption('[data-cy="event_stream_type_id"]', 'Basic Event Stream');
      cy.clickButton(/^Create event stream$/);
      cy.contains('is required.');
    });

    it('can edit an event stream', () => {
      cy.navigateTo('eda', 'event-streams');
      cy.verifyPageTitle('Event Streams');
      cy.clickTableRow(name, true);
      cy.verifyPageTitle(`${name}`);
      cy.getByDataCy('edit-event-stream').click();
      cy.verifyPageTitle(`Edit ${name}`);
      cy.getByDataCy('name').type(' edited');
      cy.clickButton(/^Save event stream$/);
      cy.verifyPageTitle(`${name} edited`);
    });

    it('can delete an event stream', () => {
      cy.navigateTo('eda', 'event-streams');
      cy.verifyPageTitle('Event Streams');
      cy.clickTableRow(`${name} edited`, true);
      cy.verifyPageTitle(`${name} edited`);
      cy.getBy('[data-cy="name"]').should('contain', `${name} edited`);
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('delete-event-stream').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete event streams');
      cy.verifyPageTitle('Event Streams');
    });
  });
});
