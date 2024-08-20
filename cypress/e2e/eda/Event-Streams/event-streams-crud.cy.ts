/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to create, edit, and delete a Project in the EDA UI.

import { randomString } from '../../../../framework/utils/random-string';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';

describe('Event Streams CRUD', () => {
  let edaCredential: EdaCredential;
  const name = 'E2E Event Stream ' + randomString(4);

  before(() => {
    cy.createBasicWebhookCredential().then((credential) => {
      edaCredential = credential;
    });
  });

  after(() => {
    cy.deleteEdaCredential(edaCredential);
  });

  it('can create an event stream, and assert the information showing on the details page', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.clickButton(/^Create event stream$/);
    cy.getByDataCy('name').type(name);
    cy.selectSingleSelectOption('[data-cy="webhook_type_id"]', 'Basic Webhook');
    cy.selectSingleSelectOption('[data-cy="credential_id"]', edaCredential.name);
    cy.clickButton(/^Create event stream$/);
    cy.verifyPageTitle(name);
    cy.hasDetail('Name', name);
    cy.hasDetail('Event stream type', 'basic');
    cy.hasDetail('Url', 'external_webhook');
  });

  it('cannot create event stream without mandatory fields', () => {
    const name = 'E2E Event Stream validation check' + randomString(4);
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.clickButton(/^Create event stream$/);
    cy.getByDataCy('name').type(name);
    cy.selectSingleSelectOption('[data-cy="webhook_type_id"]', 'Basic Webhook');
    cy.clickButton(/^Create event stream$/);
    cy.contains(/^Credential is required.$/);
  });

  it('can edit an event stream', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.clickTableRow(name, true);
    cy.verifyPageTitle(`${name}`);
    cy.getByDataCy('edit-event-stream').click();
    cy.verifyPageTitle(`Edit ${name}`);
    cy.getByDataCy('name')
      .clear()
      .type(name + ' edited');
    cy.clickButton(/^Save event stream$/);
    cy.verifyPageTitle(`${name} edited`);
  });

  it('can delete an event stream', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.clickTableRow(`${name} edited`, true);
    cy.verifyPageTitle(`${name} edited`);
    cy.clickPageAction('delete-event-stream');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete event streams');
    cy.verifyPageTitle('Event Streams');
    cy.getTableRowByText(`${name} edited`, true);
    cy.containsBy('.pf-v5-c-empty-state__title-text', 'No results found');
  });
});
