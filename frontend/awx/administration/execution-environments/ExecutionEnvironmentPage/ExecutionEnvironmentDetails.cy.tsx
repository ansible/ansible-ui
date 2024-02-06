import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { ExecutionEnvironmentDetailInner as ExecutionEnvironmentDetails } from './ExecutionEnvironmentDetails';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { formatDateString } from '../../../../../framework/utils/dateTimeHelpers';

describe('ExecutionEnvironmentDetails', () => {
  it('Component renders and displays Execution Environment Details', () => {
    cy.fixture('execution_environments.json')
      .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
        const execution_env: ExecutionEnvironment = eeResponse?.results[0];
        return execution_env;
      })
      .then((eeObject) => {
        cy.mount(<ExecutionEnvironmentDetails execution_env={eeObject} />);
        cy.get('.pf-v5-c-description-list')
          .find('.pf-v5-c-description-list__group')
          .should('have.length', 7);
      });
  });
  it('Render only required EE detail fields', () => {
    cy.fixture('execution_environments.json')
      .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
        const execution_env: ExecutionEnvironment = eeResponse?.results[0];
        execution_env['name'] = 'test';
        execution_env['managed'] = false;
        execution_env['image'] = 'this.io/is/a/test:latest';
        execution_env['pull'] = '';

        return execution_env;
      })
      .then((eeObject) => {
        cy.mount(<ExecutionEnvironmentDetails execution_env={eeObject} />);
        cy.get('[data-cy="name"]').should('have.text', 'test');
        cy.get('[data-cy="image"]').should('have.text', 'this.io/is/a/test:latest');
        cy.get('[data-cy="description"]').should('not.exist');
        cy.get('[data-cy="managed"]').should('have.text', 'false');
        cy.get('[data-cy="organization"]').should('have.text', 'Globally Available');
        cy.get('[data-cy="pull"]').should('have.text', 'Missing');
        cy.get('[date-cy="registry-credential"]').should('not.exist');
        cy.get('[data-cy="created"]').should('have.text', formatDateString(eeObject.created));
        cy.get('[data-cy="last-modified"]').should(
          'have.text',
          formatDateString(eeObject.modified)
        );
      });
  });
  it('Render all EE detail fields', () => {
    cy.fixture('execution_environments.json')
      .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
        const execution_env: ExecutionEnvironment = eeResponse?.results[0];
        execution_env['name'] = 'test';
        execution_env['managed'] = false;
        execution_env['image'] = 'this.io/is/a/test:latest';
        execution_env['description'] = 'test';
        execution_env.summary_fields.organization = { id: 1, name: 'test' };
        execution_env['pull'] = 'always';
        execution_env.summary_fields.credential = { id: 1, name: 'test', kind: 'registry' };

        return execution_env;
      })
      .then((eeObject) => {
        cy.mount(<ExecutionEnvironmentDetails execution_env={eeObject} />);
        cy.get('[data-cy="name"]').should('have.text', 'test');
        cy.get('[data-cy="image"]').should('have.text', 'this.io/is/a/test:latest');
        cy.get('[data-cy="description"]').should('have.text', 'test');
        cy.get('[data-cy="managed"]').should('have.text', 'false');
        cy.get('[data-cy="organization"]').should('have.text', 'test');
        cy.get('[data-cy="pull"]').should('have.text', 'always');
        cy.get('[data-cy="registry-credential"] > .pf-v5-c-description-list__text').should(
          'have.text',
          'test'
        );
        cy.get('[data-cy="created"]').should('have.text', formatDateString(eeObject.created));
        cy.get('[data-cy="last-modified"]').should(
          'have.text',
          formatDateString(eeObject.modified)
        );
      });
  });
});
