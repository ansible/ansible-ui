import mockAwxHost from '../../../../../cypress/fixtures/awxHost.json';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { AwxHost } from '../../../interfaces/AwxHost';
import { InventoryHostDetailsInner as InventoryHostDetails } from './InventoryHostDetails';

describe('InventoryHostDetails', () => {
  it('Component renders and displays Application', () => {
    cy.mount(<InventoryHostDetails host={mockAwxHost as unknown as AwxHost} />);
  });
  it('Render inventory host detail fields', () => {
    cy.mount(<InventoryHostDetails host={mockAwxHost as unknown as AwxHost} />);
    cy.get('[data-cy="name"]').should('have.text', 'test');
    cy.get('[data-cy="code-block-value"]').should('have.text', '---\ntest: test');
    cy.get('[data-cy="activity"] > .pf-v5-c-description-list__text').find(
      'a[href="/jobs/command/1/output"]'
    );
    cy.get('[data-cy="activity"] > .pf-v5-c-description-list__text').find(
      'a[href="/jobs/playbook/2/output"]'
    );
    cy.get('[data-cy="code-block-value"]');
    cy.get('[data-cy="created"]').should('contain.text', formatDateString(mockAwxHost.created));
    cy.get('[data-cy="last-modified"]').should(
      'contain.text',
      formatDateString(mockAwxHost.modified)
    );
  });
});
