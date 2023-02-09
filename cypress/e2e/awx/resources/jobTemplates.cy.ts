import { randomString } from '../../../../framework/utils/random-string';

describe('Job Templates Form', () => {
  it('should navigate to job templates list', () => {
    cy.navigateTo(/^Templates$/, false);
    cy.hasTitle(/^Templates$/);
  });

  it('Should throw create job template form validation error and not navigate to details view', () => {
    cy.navigateTo(/^Templates$/);
    cy.contains(/^Create template$/).click();
    cy.contains(/^Create Job Template$/).click();

    cy.clickButton(/^Create job template$/);

    cy.hasTitle(/^Create job template$/);
  });
});
