import { Organization } from '../../../../frontend/awx/interfaces/Organization';

export function runCommand(params: {
  selections: string;
  module: string;
  verbosity: string;
  forks: number;
  show_changes: boolean;
  become_enabled: boolean;
  organization: Organization;
}) {
  const organization = params.organization;

  cy.createAwxExecutionEnvironment({ organization: organization.id }).then(
    (executionEnvironment) => {
      cy.createAWXCredential({
        kind: 'machine',
        organization: organization.id,
        credential_type: 1,
      }).then((credential) => {
        cy.get('[data-cy="module-name-form-group"] [aria-label="Options menu"]').click();
        cy.getByDataCy(params.module).click();

        cy.getByDataCy('module-args').type('echo "Hello World"');

        cy.get(`[data-cy="verbosity-form-group"] [aria-label="Options menu"]`).click();
        cy.getByDataCy(params.verbosity).click();

        cy.getByDataCy('limit').should('have.value', params.selections);

        cy.getByDataCy('forks').type(params.forks.toString());

        if (params.show_changes) {
          cy.get(`[aria-label="Show changes"]`).click({ force: true });
        }

        if (params.become_enabled) {
          cy.get(`[data-cy="become_enabled"]`).click();
        }

        cy.getByDataCy('Submit').click();

        // Execution environment tab
        cy.singleSelectByDataCy('executionEnvironment', executionEnvironment.name);

        cy.getByDataCy('Submit').click();

        // Credentials tab

        // check that everything is correctly rendered in the form, so it does not fail sometimes
        cy.getByDataCy('wizard');
        cy.getByDataCy('wizard-nav');
        cy.getByDataCy('credential');
        cy.getByDataCy('credential-form-group');
        cy.getByDataCy('wizard-footer');
        cy.getByDataCy('Submit');
        cy.getByDataCy('wizard-back');
        cy.getByDataCy('wizard-cancel');
        cy.contains(`[data-cy='credential']`, 'Select credential');

        cy.getByDataCy('credential').click();
        cy.get(`[role='listbox'] button`);
        cy.contains('button', 'Browse').click();

        cy.filterTableByMultiSelect('name', [credential.name]);
        cy.get(`[aria-label="Simple table"] tr`, { timeout: 8000 }).should('have.length', 2);

        cy.get(`[data-cy="checkbox-column-cell"] input`).click();

        cy.contains('button', 'Confirm').click();

        cy.getByDataCy('Submit').click();

        // review tab
        cy.getByDataCy('module').contains(params.module);
        cy.getByDataCy('arguments').contains('echo "Hello World"');
        cy.getByDataCy('limit').contains(params.selections);
        cy.getByDataCy('forks').contains(params.forks.toString());
        cy.getByDataCy('show-changes').contains(params.show_changes ? 'On' : 'Off');
        cy.getByDataCy('privilege-escalation').contains(params.become_enabled ? 'On' : 'Off');
        cy.getByDataCy('execution-environment').contains(executionEnvironment.name);
        cy.getByDataCy('credentials').contains(credential.name);

        cy.getByDataCy('Submit').click();
        cy.get(`a[role="tab"]`).contains('Output').click();
        cy.get(`a[role="tab"]`).contains('Detail').click();

        // review tab
        cy.getByDataCy('name').contains(params.module);
        cy.getByDataCy('module-arguments').contains('echo "Hello World"');
        cy.getByDataCy('forks').contains(params.forks.toString());

        cy.getByDataCy('execution-environment').contains(executionEnvironment.name);

        cy.deleteAwxCredential(credential, { failOnStatusCode: false });
        cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
      });
    }
  );
}
