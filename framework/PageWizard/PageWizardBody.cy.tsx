/* eslint-disable i18next/no-literal-string */
import { PageWizardBody } from './PageWizardBody';
import { PageWizardProvider } from './PageWizardProvider';

describe('PageWizardBody', () => {
  it('should render the provided element within a page section', () => {
    cy.mount(
      <PageWizardProvider
        steps={[{ id: 'step1', label: 'Step 1', element: <p>Step 1</p> }]}
        onSubmit={() => Promise.resolve()}
      >
        <PageWizardBody onCancel={() => {}} />
      </PageWizardProvider>
    );
    cy.get('[data-cy="wizard-section-step1"]').should('exist');
    cy.get('[data-cy="wizard-footer"]').should('exist');
    cy.get('[data-cy="wizard-section-step1"] p').should('contain.text', 'Step 1');
  });

  it('should render the provided inputs within a form', () => {
    cy.mount(
      <PageWizardProvider
        steps={[{ id: 'step1', label: 'Step 1', inputs: <input data-cy="mocked-input" /> }]}
        onSubmit={() => Promise.resolve()}
      >
        <PageWizardBody onCancel={() => {}} />
      </PageWizardProvider>
    );
    cy.get('form').should('exist');
    cy.get('[data-cy="wizard-footer"]').should('exist');
    cy.get('[data-cy="mocked-input"]').should('exist');
  });
});
