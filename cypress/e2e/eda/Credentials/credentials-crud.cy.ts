//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { EdaCredential, EdaCredentialCreate } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { SAAS_URL } from '../../../support/constants';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA Credentials', () => {
    let edaOrg: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });

    describe('EDA Credentials- Create, Edit, Delete', () => {
      it('can create a container registry credential, and assert the information showing on the details page', () => {
        const name = 'E2E Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.get('h1').should('contain', 'Credentials');
        cy.clickButton(/^Create credential$/);
        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('This is a container registry credential.');
        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('table').should('exist');
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
        cy.selectDropdownOptionByResourceName('credential-type-id', 'Container Registry');
        cy.get('[data-cy="inputs-username"]').type('admin');
        cy.get('[data-cy="inputs-password"]').type('testtoken');
        cy.clickButton(/^Create credential$/);
        cy.hasDetail('Name', name);
        cy.hasDetail('Description', 'This is a container registry credential.');
        cy.hasDetail('Credential type', 'Container Registry');
        cy.hasDetail('Username', 'admin');
        cy.getEdaCredentialByName(name).then((credential) => {
          cy.wrap(credential).should('not.be.undefined');
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });

      it('can create a GitHub token credential, and assert the information showing on the details page', () => {
        const name = 'E2E Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.get('h1').should('contain', 'Credentials');
        cy.clickButton(/^Create credential$/);
        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('This is a GitHub Credential.');
        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('table').should('exist');
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
        cy.selectDropdownOptionByResourceName('credential-type-id', 'Source Control');
        cy.get('[data-cy="inputs-password"]').type('testtoken');
        cy.get('[data-cy="inputs-username"]').type('admin');
        cy.clickButton(/^Create credential$/);
        cy.hasDetail('Name', name);
        cy.hasDetail('Description', 'This is a GitHub Credential.');
        cy.hasDetail('Credential type', 'Source Control');
        cy.hasDetail('Username', 'admin');
        cy.getEdaCredentialByName(name).then((credential) => {
          cy.wrap(credential).should('not.be.undefined');
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });

      it('can edit a credential', () => {
        cy.createEdaCredential(edaOrg.id).then((edaCredential) => {
          cy.navigateTo('eda', 'credentials');
          cy.get('h1').should('contain', 'Credentials');
          cy.clickTableRow(edaCredential.name);
          cy.clickButton(/^Edit credential$/);
          cy.verifyPageTitle(`Edit ${edaCredential.name}`);
          cy.get('[data-cy="name"]')
            .clear()
            .type(edaCredential.name + 'lalala');
          cy.get('[data-cy="description"]').clear().type('this credential type has been changed');
          cy.clickButton(/^Save credential$/);
          cy.hasDetail('Name', edaCredential.name + 'lalala');
          cy.hasDetail('Description', 'this credential type has been changed');
          cy.navigateTo('eda', 'credentials');
          cy.deleteEdaCredential(edaCredential);
        });
      });

      it('can delete a credential', () => {
        cy.createEdaCredential(edaOrg.id).then((edaCredential) => {
          cy.navigateTo('eda', 'credentials');
          cy.get('h1').should('contain', 'Credentials');
          cy.clickTableRow(edaCredential.name);
          cy.verifyPageTitle(edaCredential.name);
          cy.intercept(
            'GET',
            edaAPI`/eda-credentials/${edaCredential.id.toString()}/?refs=true`
          ).as('edaCredentials');
          cy.clickPageAction('delete-credential');
          cy.wait('@edaCredentials');
          cy.intercept('DELETE', edaAPI`/eda-credentials/${edaCredential.id.toString()}/`).as(
            'deleted'
          );
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete credential');
          cy.wait('@deleted').then((deleted) => {
            expect(deleted?.response?.statusCode).to.eql(204);
            cy.verifyPageTitle('Credentials');
          });
        });
      });

      it('get warning while deleting a credential already in use', () => {
        cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
          name: 'E2E Credential ' + randomString(4),
          organization_id: edaOrg.id,
          credential_type_id: 1,
          description: 'This is a Credential with Source Control type',
          inputs: {
            username: 'username',
            password: 'password',
          },
        }).then((edaCredential: Partial<EdaCredential>) => {
          cy.requestPost<EdaProject>(edaAPI`/projects/`, {
            name: 'E2E Project ' + randomString(4),
            organization_id: edaOrg.id,
            url: 'https://github.com/ansible/ansible-ui',
            eda_credential_id: edaCredential.id,
          }).then((project) => {
            cy.navigateTo('eda', 'credentials');
            cy.get('h1').should('contain', 'Credentials');
            const edaCredentialName = edaCredential.name as string;
            cy.clickTableRow(edaCredentialName);
            const edaCredentialId = edaCredential.id as number;
            cy.intercept(
              'DELETE',
              edaAPI`/eda-credentials/${edaCredentialId.toString()}/?force=true`
            ).as('deleted');
            cy.verifyPageTitle(edaCredentialName);
            cy.clickPageAction('delete-credential');
            cy.clickModalConfirmCheckbox();
            cy.get('.pf-v5-c-alert__title').contains(
              `The following credentials are in use: ${edaCredentialName}`
            );
            cy.clickModalButton('Delete credential');
            cy.wait('@deleted').then((deleted) => {
              expect(deleted?.response?.statusCode).to.eql(204);
              cy.verifyPageTitle('Credentials');
            });
            cy.deleteEdaProject(project);
          });
        });
      });

      it('get warning while deleting a credential already in use by an event stream', () => {
        cy.createBasicEventStreamCredential(edaOrg.id).then((credential) => {
          cy.createBasicEventStream(credential, edaOrg.id).then((event_stream) => {
            cy.navigateTo('eda', 'credentials');
            cy.verifyPageTitle('Credentials');
            cy.clickTableRow(credential.name);
            cy.intercept('DELETE', edaAPI`/eda-credentials/${credential.id.toString()}`).as(
              'deleted'
            );
            cy.verifyPageTitle(credential.name);
            cy.clickPageAction('delete-credential');
            cy.clickModalConfirmCheckbox();
            cy.clickModalButton('Delete credential');
            cy.contains(
              `Credential ${credential.name} is being referenced by some event streams and cannot be deleted`
            );
            cy.wait('@deleted').then((deleted) => {
              expect(deleted?.response?.statusCode).to.eql(409);
            });
            cy.clickModalButton('Close');
            cy.deleteEventStream(event_stream);
            cy.deleteEdaCredential(credential);
          });
        });
      });
    });
  });
});
