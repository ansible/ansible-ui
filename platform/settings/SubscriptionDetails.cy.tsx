import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { SubscriptionDetails } from './SubscriptionDetails';

const awxConfig = {
  license_info: {
    instance_count: 9999999,
    license_date: 1723953599,
    license_type: 'enterprise',
    sku: 'ES0113909',
    usage: 'Development/Test',
    satellite: null,
    valid_key: true,
    product_name: 'Red Hat Ansible Automation Platform',
    support_level: 'Self-Support',
    subscription_name: 'Example subscription name',
    deleted_instances: 0,
    reactivated_instances: 0,
    current_instances: 1,
    automated_instances: 1,
    automated_since: 1715173202,
    free_instances: 9999998,
    time_remaining: 8776404,
    trial: false,
    grace_period_remaining: 11368404,
    compliant: true,
    date_warning: false,
    date_expired: false,
  },
};

describe('SubscriptionDetails', () => {
  it('Component renders and displays correct subscription details when SUBSCRIPTION_USAGE_MODEL = unique_managed_hosts', () => {
    cy.intercept(
      { method: 'GET', url: `/api/v2/settings/system/` },
      {
        SUBSCRIPTION_USAGE_MODEL: 'unique_managed_hosts',
      }
    );
    cy.intercept({ method: 'GET', url: `/api/v2/config/` }, awxConfig);

    cy.mount(
      <AwxConfigProvider>
        <SubscriptionDetails />
      </AwxConfigProvider>
    );
    cy.get('#subscription').should('have.text', 'Example subscription name');
    cy.get('#status').should('have.text', 'Compliant');
    cy.get('#hosts-automated').should('have.text', '1');
    cy.get('#hosts-imported').should('have.text', '1');
    cy.get('#hosts-remaining').should('have.text', '9999998');
    cy.get('#hosts-deleted').should('have.text', '0');
    cy.get('#active-hosts-previously-deleted').should('have.text', '0');
    cy.get('#subscription-type').should('have.text', 'Enterprise');
    cy.get('#trial').should('have.text', 'No');
    cy.get('#days-remaining').should('have.text', '101');
    cy.get('#expires-on').should('exist');
  });
  it('Component renders and displays correct subscription details when SUBSCRIPTION_USAGE_MODEL != unique_managed_hosts', () => {
    cy.intercept(
      { method: 'GET', url: `/api/v2/settings/system/` },
      {
        SUBSCRIPTION_USAGE_MODEL: '',
      }
    );
    cy.intercept({ method: 'GET', url: `/api/v2/config/` }, awxConfig);

    cy.mount(
      <AwxConfigProvider>
        <SubscriptionDetails />
      </AwxConfigProvider>
    );
    cy.get('#subscription').should('have.text', 'Example subscription name');
    cy.get('#status').should('not.exist');
    cy.get('#hosts-automated').should('not.exist');
    cy.get('#hosts-imported').should('not.exist');
    cy.get('#hosts-remaining').should('not.exist');
    cy.get('#hosts-deleted').should('not.exist');
    cy.get('#active-hosts-previously-deleted').should('not.exist');
    cy.get('#subscription-type').should('have.text', 'Enterprise');
    cy.get('#trial').should('have.text', 'No');
    cy.get('#days-remaining').should('have.text', '101');
    cy.get('#expires-on').should('exist');
  });
});
