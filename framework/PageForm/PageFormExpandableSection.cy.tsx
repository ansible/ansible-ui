import { PageFormExpandableSection } from './PageFormExpandableSection';

describe('PageFromExpandableSection', () => {
  const childrenContent = 'Test';
  beforeEach(() => {
    cy.mount(
      <PageFormExpandableSection singleColumn={true}>
        <div id="expandable-section">{childrenContent}</div>
      </PageFormExpandableSection>
    );
  });

  it('should expand the section when clicked on', () => {
    cy.get('.pf-v5-c-expandable-section__toggle-text').should(
      'contain.text',
      'Show advanced options'
    );
    cy.get('#expandable-section').should('not.be.visible');
    cy.get('button').click();
    cy.get('.pf-v5-c-expandable-section__toggle-text').should(
      'contain.text',
      'Hide advanced options'
    );
    cy.get('#expandable-section').should('be.visible').should('contain.text', childrenContent);
    cy.get('button').click();
    cy.get('#expandable-section').should('not.be.visible');
    cy.get('.pf-v5-c-expandable-section__toggle-text').should(
      'contain.text',
      'Show advanced options'
    );
  });
});
