/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { edaAPI } from '../../../support/formatApiPathForEDA';
import { EdaEventStream } from '../../../../frontend/eda/interfaces/EdaEventStream';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';

//Tests a user's ability to perform necessary actions on the Event Streams list in the EDA UI.
describe('Event Streams List', () => {
  let EdaEventStream1: EdaEventStream;
  let EdaEventStream2: EdaEventStream;
  let EdaCredential: EdaCredential;
  let EdaOrganization: EdaOrganization;

  before(() => {
    cy.createEdaOrganization().then((org) => {
      EdaOrganization = org;
      cy.createBasicEventStreamCredential(org.id).then((credential) => {
        EdaCredential = credential;
        cy.createBasicEventStream(credential, org.id).then((EdaEventStream) => {
          EdaEventStream1 = EdaEventStream;
        });
        cy.createBasicEventStream(credential, org.id).then((EdaEventStream) => {
          EdaEventStream2 = EdaEventStream;
        });
      });
    });
  });

  after(() => {
    cy.deleteEventStream(EdaEventStream1);
    cy.deleteEventStream(EdaEventStream2);
    cy.deleteEdaCredential(EdaCredential);
    cy.deleteEdaOrganization(EdaOrganization);
  });

  it('renders the Event Streams page and filter', () => {
    cy.navigateTo('eda', 'event-streams');
    cy.verifyPageTitle('Event Streams');
    cy.filterTableByText(EdaEventStream1.name);
    cy.get('td[data-cy=name-column-cell]').should('contain', EdaEventStream1.name);
    cy.clickButton(/^Clear all filters$/);
    cy.filterTableByText(EdaEventStream2.name);
    cy.get('td[data-cy=name-column-cell]').should('contain', EdaEventStream2.name);
  });

  it('can switch the event stream to test mode from the list view', () => {
    cy.navigateTo('eda', 'event-streams');
    cy.verifyPageTitle('Event Streams');
    cy.intercept('PATCH', edaAPI`/event-streams/${EdaEventStream1.id.toString()}/`).as(
      'event-stream1'
    );
    cy.filterTableByText(EdaEventStream1.name);
    cy.clickTableRowAction('name', EdaEventStream1.name, 'toggle-switch', {
      disableFilter: true,
      inKebab: false,
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Disable forwarding of events');
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.wait('@event-stream1').then((event_stream) => {
      expect(event_stream?.response?.statusCode).to.eql(200);
    });
  });

  it('can bulk delete event streams', () => {
    cy.navigateTo('eda', 'event-streams');
    cy.verifyPageTitle('Event Streams');
    cy.filterTableByText(EdaEventStream1.name);
    cy.contains('tr', EdaEventStream1.name).within(() => {
      cy.get('input[type=checkbox]').eq(0).click();
    });
    cy.clickButton(/^Clear all filters$/);
    cy.filterTableByText(EdaEventStream2.name);
    cy.contains('tr', EdaEventStream2.name).within(() => {
      cy.get('input[type=checkbox]').eq(0).click();
    });
    cy.clickToolbarKebabAction('delete-selected-event-streams');
    cy.intercept('DELETE', edaAPI`/event-streams/${EdaEventStream1.id.toString()}/`).as(
      'eventstream1'
    );
    cy.intercept('DELETE', edaAPI`/event-streams/${EdaEventStream2.id.toString()}/`).as(
      'eventstream2'
    );
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete event streams');
    cy.wait('@eventstream1').then((eventstream) => {
      expect(eventstream?.response?.statusCode).to.eql(204);
    });
    cy.wait('@eventstream2').then((eventstream) => {
      expect(eventstream?.response?.statusCode).to.eql(204);
    });
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
