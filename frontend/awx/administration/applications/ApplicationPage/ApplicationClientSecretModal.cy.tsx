/* eslint-disable i18next/no-literal-string */
import { Application } from '../../../interfaces/Application';
import { ApplicationClientSecretModal } from './ApplicationClientSecretModal';

describe('ApplicationClientSecretModal', () => {
  let application: Application;

  beforeEach(() => {
    cy.fixture('application.json').then((app: Application) => {
      application = app;
    });
  });
  it('Displays warning', () => {
    cy.mount(
      <ApplicationClientSecretModal
        applicationModalSource={application}
        onClose={() => undefined}
      />
    );
    cy.get('.pf-v5-c-alert__title').should(
      'contain.text',
      'This is the only time the client secret will be shown.'
    );
  });
  it('Displays name', () => {
    cy.mount(
      <ApplicationClientSecretModal
        applicationModalSource={application}
        onClose={() => undefined}
      />
    );
    cy.get('[data-cy="name"] > .pf-v5-c-description-list__text').should('have.text', 'test');
  });
  it('Displays client id', () => {
    cy.mount(
      <ApplicationClientSecretModal
        applicationModalSource={application}
        onClose={() => undefined}
      />
    );
    cy.get('input[id="text-input-4"]').should('have.value', application.client_id);
  });
  it('Displays client secret', () => {
    cy.mount(
      <ApplicationClientSecretModal
        applicationModalSource={application}
        onClose={() => undefined}
      />
    );
    cy.get('input[id="text-input-7"]').should('have.value', application.client_secret);
  });
});
