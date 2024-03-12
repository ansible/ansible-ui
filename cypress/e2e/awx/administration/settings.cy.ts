import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('AWX Settings', () => {
  before(() => {
    cy.awxLogin();
  });

  it('should be able to change user preferences', () => {
    cy.navigateTo('awx', 'settings-preferences');
    cy.verifyPageTitle('User Preferences');
    cy.singleSelectBy('#tablelayout', 'Compact');
    cy.getByDataCy('Submit').click();

    cy.navigateTo('awx', 'settings-preferences');
    cy.get('#tablelayout').should('contain', 'Compact');
    cy.singleSelectBy('#tablelayout', 'Comfortable');
    cy.getByDataCy('Submit').click();
  });

  // System settings is broken because of analytics settings on backend :(
  // it('should be able to change system settings', () => {
  //   cy.requestPatch(awxAPI`/settings/all/`, {
  //     ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC: false,
  //   });

  //   cy.navigateTo('awx', 'settings-system');
  //   cy.verifyPageTitle('System Settings');
  //   cy.getByDataCy('ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC').should('not.be.checked');
  //   cy.getByDataCy('ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC').click();
  //   cy.getByDataCy('ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC').should('be.checked');
  //   cy.intercept('PATCH', awxAPI`/settings/all/`).as('patchSettings');
  //   cy.getByDataCy('Submit').click();
  //   cy.wait('@patchSettings').its('response.statusCode').should('eq', 200);

  //   cy.navigateTo('awx', 'settings-system');
  //   cy.getByDataCy('ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC').should('be.checked');

  //   cy.requestPatch(awxAPI`/settings/all/`, {
  //     ACTIVITY_STREAM_ENABLED_FOR_INVENTORY_SYNC: false,
  //   });
  // });

  it('should be able to change job settings', () => {
    cy.requestPatch(awxAPI`/settings/all/`, { AWX_ROLES_ENABLED: true });

    cy.navigateTo('awx', 'settings-jobs');
    cy.verifyPageTitle('Job Settings');
    cy.get('[data-cy=AWX_ROLES_ENABLED]').scrollIntoView().should('be.visible');
    cy.getByDataCy('AWX_ROLES_ENABLED').should('be.checked');
    cy.getByDataCy('AWX_ROLES_ENABLED').click();
    cy.getByDataCy('AWX_ROLES_ENABLED').should('not.be.checked');
    cy.intercept('PATCH', awxAPI`/settings/all/`).as('patchSettings');
    cy.getByDataCy('Submit').click();
    cy.wait('@patchSettings').its('response.statusCode').should('eq', 200);

    cy.navigateTo('awx', 'settings-jobs');
    cy.get('[data-cy=AWX_ROLES_ENABLED]').scrollIntoView().should('be.visible');
    cy.getByDataCy('AWX_ROLES_ENABLED').should('not.be.checked');

    cy.requestPatch(awxAPI`/settings/all/`, { AWX_ROLES_ENABLED: true });
  });

  it('should be able to change logging settings', () => {
    cy.requestPatch(awxAPI`/settings/all/`, {
      LOG_AGGREGATOR_INDIVIDUAL_FACTS: false,
    });

    cy.navigateTo('awx', 'settings-logging');
    cy.verifyPageTitle('Logging Settings');
    cy.getByDataCy('LOG_AGGREGATOR_INDIVIDUAL_FACTS').should('not.be.checked');
    cy.getByDataCy('LOG_AGGREGATOR_INDIVIDUAL_FACTS').click();
    cy.getByDataCy('LOG_AGGREGATOR_INDIVIDUAL_FACTS').should('be.checked');
    cy.intercept('PATCH', awxAPI`/settings/all/`).as('patchSettings');
    cy.getByDataCy('Submit').click();
    cy.wait('@patchSettings').its('response.statusCode').should('eq', 200);

    cy.navigateTo('awx', 'settings-logging');
    cy.getByDataCy('LOG_AGGREGATOR_INDIVIDUAL_FACTS').should('be.checked');

    cy.requestPatch(awxAPI`/settings/all/`, {
      LOG_AGGREGATOR_INDIVIDUAL_FACTS: false,
    });
  });

  it('should be able to change customize login settings', () => {
    cy.requestPatch(awxAPI`/settings/all/`, { CUSTOM_LOGIN_INFO: '' });

    cy.navigateTo('awx', 'settings-customize-login');
    cy.verifyPageTitle('Customize Login');
    cy.getByDataCy('custom-login-info').should('be.empty');
    cy.getByDataCy('custom-login-info').type('my custom login info');
    cy.intercept('PATCH', awxAPI`/settings/all/`).as('patchSettings');
    cy.getByDataCy('Submit').click();
    cy.wait('@patchSettings').its('response.statusCode').should('eq', 200);

    cy.navigateTo('awx', 'settings-customize-login');
    cy.getByDataCy('custom-login-info').should('have.value', 'my custom login info');

    cy.requestPatch(awxAPI`/settings/all/`, { CUSTOM_LOGIN_INFO: '' });
  });

  it('should be able to change troubleshooting settings', () => {
    cy.requestPatch(awxAPI`/settings/all/`, { AWX_CLEANUP_PATHS: true });

    cy.navigateTo('awx', 'settings-troubleshooting');
    cy.verifyPageTitle('Troubleshooting');
    cy.getByDataCy('AWX_CLEANUP_PATHS').should('be.checked');
    cy.getByDataCy('AWX_CLEANUP_PATHS').click();
    cy.getByDataCy('AWX_CLEANUP_PATHS').should('not.be.checked');
    cy.intercept('PATCH', awxAPI`/settings/all/`).as('patchSettings');
    cy.getByDataCy('Submit').click();
    cy.wait('@patchSettings').its('response.statusCode').should('eq', 200);

    cy.navigateTo('awx', 'settings-troubleshooting');
    cy.getByDataCy('AWX_CLEANUP_PATHS').should('not.be.checked');

    cy.requestPatch(awxAPI`/settings/all/`, { AWX_CLEANUP_PATHS: true });
  });
});
