import { PageFormExpandableSection } from './PageFormExpandableSection';

describe('PageFormExpandableSection', () => {
  const childrenContent = 'Test';

  beforeEach(() => {
    cy.mount(
      <PageFormExpandableSection singleColumn={true}>
        <div id="expandable-section">{childrenContent}</div>
      </PageFormExpandableSection>
    );
  });

  it('should expand the section when clicked on', () => {
    cy.get('#expandable-section').should('not.be.visible');
    cy.contains('button', /show advanced options/i).click();
    cy.get('#expandable-section').should('be.visible').and('contain.text', childrenContent);
    cy.contains('button', /hide advanced options/i).should('exist');
    cy.contains('button', /hide advanced options/i).click();
    cy.get('#expandable-section').should('not.be.visible');
    cy.contains('button', /show advanced options/i).should('exist');
  });
});
