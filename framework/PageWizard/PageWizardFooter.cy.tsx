/* eslint-disable i18next/no-literal-string */
import { PageWizardFooter } from './PageWizardFooter';
import { PageWizardContext } from './PageWizardProvider';

describe('PageWizardFooter', () => {
  const step1 = { id: 'step1', label: 'Step 1', element: <p>Step 1</p> };
  const step2 = { id: 'step2', label: 'Step 2', element: <p>Step 2</p> };
  const step3 = { id: 'step3', label: 'Step 3', element: <p>Step 3</p> };

  const wizardContext = {
    activeStep: step1,
    steps: [step1, step2, step3],
    visibleSteps: [step1, step2, step3],
    visibleStepsFlattened: [step1, step2, step3],
    isToggleExpanded: false,
    setActiveStep: () => {},
    setStepData: () => {},
    setStepError: () => {},
    setToggleExpanded: () => {},
    setWizardData: () => {},
    stepData: {},
    stepError: {},
    wizardData: {},
    onNext: () => Promise.resolve(),
    onBack: () => {},
    setSubmitError: () => {},
  };

  it('should show "Finish" instead of "Next" if active step is the last step', () => {
    cy.mount(
      <PageWizardContext.Provider value={{ ...wizardContext, activeStep: step3 }}>
        <PageWizardFooter onNext={() => {}} onBack={() => {}} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );
    cy.get('[data-cy="wizard-next"]').should('contain.text', 'Finish');
  });

  it('should disable back button if active step is the first step', () => {
    const onNext = cy.stub().as('next');
    cy.mount(
      <PageWizardContext.Provider value={wizardContext}>
        <PageWizardFooter onNext={onNext} onBack={() => {}} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );
    cy.get('[data-cy="wizard-next"]').should('contain.text', 'Next');
    cy.get('[data-cy="wizard-back"]').should('be.disabled');
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('@next').should('be.calledOnce');
  });

  it('should enable back button if active step is not the first step', () => {
    const onBack = cy.stub().as('back');
    cy.mount(
      <PageWizardContext.Provider value={{ ...wizardContext, activeStep: step2 }}>
        <PageWizardFooter onNext={() => {}} onBack={onBack} onCancel={() => {}} />
      </PageWizardContext.Provider>
    );
    cy.get('[data-cy="wizard-back"]').should('contain.text', 'Back');
    cy.get('[data-cy="wizard-back"]').should('not.be.disabled');
    cy.get('[data-cy="wizard-back"]').click();
    cy.get('@back').should('be.calledOnce');
  });

  it('should handle onCancel callback', () => {
    const onCancel = cy.stub().as('cancel');
    cy.mount(
      <PageWizardContext.Provider value={wizardContext}>
        <PageWizardFooter onNext={() => {}} onBack={() => {}} onCancel={onCancel} />
      </PageWizardContext.Provider>
    );
    cy.get('[data-cy="wizard-cancel"]').should('contain.text', 'Cancel');
    cy.get('[data-cy="wizard-cancel"]').click();
    cy.get('@cancel').should('be.calledOnce');
  });
});
