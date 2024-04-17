/* eslint-disable i18next/no-literal-string */
import { PageFormTextInput } from '../PageForm/Inputs/PageFormTextInput';
import { PageWizard } from './PageWizard';

describe('PageWizard', () => {
  const Review = () => {
    return <h1>Review</h1>;
  };
  const steps = [
    {
      id: 'hidden',
      label: 'Hidden',
      inputs: <input type="text" />,
      hidden: () => true,
    },
    {
      id: 'welcome',
      label: 'Welcome',
      element: <h1>Welcome</h1>,
    },
    {
      id: 'inputs',
      label: 'Inputs',
      inputs: (
        <>
          <PageFormTextInput label="Input 1" name="input_1" />
          <PageFormTextInput label="Input 2" name="input_2" />
        </>
      ),
    },
    {
      id: 'review',
      label: 'Review',
      element: <Review />,
    },
  ];

  beforeEach(() => {
    const onCancel = cy.stub().as('cancel');
    const onSubmit = cy.stub().as('submit');
    cy.mount(
      <PageWizard
        steps={steps}
        onCancel={onCancel}
        onSubmit={onSubmit}
        defaultValue={{
          inputs: {
            input_1: 'value 1',
            input_2: 'value 2',
          },
        }}
      />
    );
  });

  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Welcome');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Inputs');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
  });

  it('should hide step when hidden is set to true', () => {
    cy.get('[data-cy="wizard-nav"] li').should('not.contain', 'Hidden');
  });

  it('should disable back button on initial step', () => {
    cy.get('[data-cy="wizard-next"]').should('not.be.disabled');
    cy.get('[data-cy="wizard-next"]').should('contain.text', 'Next');
    cy.get('[data-cy="wizard-back"]').should('be.disabled');
    cy.get('[data-cy="wizard-back"]').should('contain.text', 'Back');
    cy.get('[data-cy="wizard-cancel"]').should('not.be.disabled');
    cy.get('[data-cy="wizard-cancel"]').should('contain.text', 'Cancel');
  });

  it('should navigate to next step when clicking next in the footer', () => {
    cy.get('[data-cy="wizard-nav-item-welcome"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-inputs"] button').should('be.disabled');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('be.disabled');
    cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
    cy.get('[data-cy="wizard-next"]').click();

    cy.get('[data-cy="wizard-nav-item-welcome"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-inputs"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('be.disabled');
    cy.get('[data-cy="wizard"] form').should('contain.text', 'Input 1');
    cy.get('[data-cy="wizard"] form').should('contain.text', 'Input 2');
    cy.get('[data-cy="Submit"]').click();

    cy.get('[data-cy="wizard-nav-item-welcome"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-inputs"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-section-review"]').should('contain.text', 'Review');
    cy.get('[data-cy="wizard-next"]').should('contain.text', 'Finish');
  });

  it('should navigate to previous step when clicking back in the footer', () => {
    cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('[data-cy="wizard"] form').should('contain.text', 'Input 1');
    cy.get('[data-cy="wizard-back"]').click();
    cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
  });

  it('should be able to jump from last step to initial step in the navigation sidebar', () => {
    cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('[data-cy="wizard"] form').should('contain.text', 'Input 1');
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="wizard-section-review"]').should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-welcome"] button').click();
    cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
  });

  it('should pass default values to form inputs', () => {
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('input[data-cy="input-1"]').should('contain.value', 'value 1');
    cy.get('input[data-cy="input-2"]').should('contain.value', 'value 2');
  });

  it('should handle onCancel callback', () => {
    cy.get('[data-cy="wizard-cancel"]').click();
    cy.get('@cancel').should('have.been.calledOnce');
  });

  it('should handle onSubmit callback', () => {
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="wizard-section-review"]').should('contain.text', 'Review');
    cy.get('[data-cy="wizard-next"]').click();
    cy.get('@submit').should('have.been.calledOnce');
  });

  describe('Substeps', () => {
    const stepsWithSubsteps = [
      {
        id: 'welcome',
        label: 'Welcome',
        element: <h1>Welcome</h1>,
      },
      {
        id: 'parentStep',
        label: 'Parent step',
        substeps: [
          {
            id: 'substepA',
            label: 'Substep A',
            element: <h1>Substep A</h1>,
          },
          {
            id: 'substepB',
            label: 'Substep B',
            element: <h1>Substep B</h1>,
          },
        ],
      },
    ];
    beforeEach(() => {
      const onCancel = cy.stub().as('cancel');
      const onSubmit = cy.stub().as('submit');
      cy.mount(
        <PageWizard
          steps={stepsWithSubsteps}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultValue={{
            inputs: {
              input_1: 'value 1',
              input_2: 'value 2',
            },
          }}
        />
      );
    });

    it('should navigate to next step when clicking next in the footer', () => {
      cy.get('[data-cy="wizard-nav-item-welcome"] button').should('have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-nav-item-substepA"] button').should('be.disabled');
      cy.get('[data-cy="wizard-nav-item-substepB"] button').should('be.disabled');
      cy.get('[data-cy="wizard-next"]').click();

      cy.get('[data-cy="wizard-nav-item-welcome"] button').should('not.have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-nav-item-substepA"] button').should('have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-section-substepA"]').should('contain.text', 'Substep A');
      cy.get('[data-cy="wizard-nav-item-substepB"] button').should('be.disabled');
      cy.get('[data-cy="wizard-next"]').click();

      cy.get('[data-cy="wizard-nav-item-welcome"] button').should('not.have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-nav-item-substepA"] button').should(
        'not.have.class',
        'pf-m-current'
      );
      cy.get('[data-cy="wizard-nav-item-substepB"] button').should('have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-section-substepB"]').should('contain.text', 'Substep B');
      cy.get('[data-cy="wizard-next"]').should('contain.text', 'Finish');
    });

    it('should navigate to previous step when clicking back in the footer', () => {
      cy.get('[data-cy="wizard-next"]').click();
      cy.get('[data-cy="wizard-nav-item-substepA"] button').should('have.class', 'pf-m-current');
      cy.get('[data-cy="wizard-section-substepA"]').should('contain.text', 'Substep A');
      cy.get('[data-cy="wizard-back"]').click();
      cy.get('[data-cy="wizard-section-welcome"]').should('contain.text', 'Welcome');
    });
  });
});
