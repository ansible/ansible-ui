/* eslint-disable i18next/no-literal-string */
import { ErrorAlert } from './ErrorAlert';

describe('ErrorAlert', () => {
  it('displays a string error', () => {
    const error = 'An error occurred';
    cy.mount(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);
    cy.get('Alert').should('not.exist');
    cy.contains(error).should('be.visible');
    cy.get('.pf-v5-c-alert__title').should('exist');
  });

  it('displays a ReactNode error', () => {
    const error = <span>Error as ReactNode</span>;
    cy.mount(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);
    cy.contains('Error as ReactNode').should('be.visible');
    cy.get('.pf-v5-c-alert__title').should('exist');
  });

  it('does not render when error is null', () => {
    cy.mount(<ErrorAlert error={null} isMd={true} onCancel={() => {}} />);
    cy.get('Alert').should('not.exist');
    cy.get('.pf-v5-c-alert__title').should('not.exist');
  });

  it('displays the expanded content when error is an array with more than one item', () => {
    const error = ['Error one', 'Error two', 'Error three'];
    cy.mount(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);
    cy.get('.pf-v5-c-alert__toggle').click();
    cy.contains(error[0]).should('be.visible');
    cy.contains(error[1]).should('be.visible');
    cy.contains(error[2]).should('be.visible');
    cy.get('.pf-v5-c-alert__title').should('exist');
  });

  it('displays the correct padding when isMd is true and onCancel is provided', () => {
    const error = 'An error occurred';
    cy.mount(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);
    cy.get('.pf-v5-c-alert').should('have.css', 'paddingLeft', '24px');
  });

  it('does not display padding when isMd is false and onCancel is provided', () => {
    const error = 'An error occurred';
    cy.mount(<ErrorAlert error={error} isMd={false} onCancel={() => {}} />);
    cy.get('.pf-v5-c-alert').should('not.have.css', 'paddingLeft', '24px');
  });

  it('does not display padding when isMd is true and onCancel is not provided', () => {
    const error = 'An error occurred';
    cy.mount(<ErrorAlert error={error} isMd={true} />);
    cy.get('.pf-v5-c-alert').should('not.have.css', 'paddingLeft', '24px');
  });

  it('displays a single error from an array of errors without expanding', () => {
    const error = ['An error occurred'];
    cy.mount(<ErrorAlert error={error} isMd={true} onCancel={() => {}} />);
    cy.get('.pf-v5-c-alert__toggle').should('not.exist');
    cy.contains(error[0]).should('be.visible');
    cy.get('.pf-v5-c-alert__title').should('exist');
  });
});
