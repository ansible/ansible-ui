import { SubscriptionWizard } from './SubscriptionWizard';

describe('Subscription Wizard', () => {
  it('renders the subscription wizard, checks the links are reachable', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.get('[data-cy="wizard"]').should('exist');
    cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should('be.visible');
    cy.contains('p', 'If you do not have a subscription, you can visit Red Hat to obtain a').should(
      'be.visible'
    );
    const URLS = [
      'https://www.ansible.com/license',
      'https://access.redhat.com/management/subscription_allocations',
    ];
    URLS.forEach((url, index) => {
      cy.get('a[target="_blank"]')
        .eq(index)
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.include(url);

          // Make a GET request to both links and check if the links are successfully reachable
          cy.request({
            method: 'GET',
            url: href as string,
          })
            .its('status')
            .should('eq', 200);
        });
    });
  });

  it('renders the first step, verify toggle options', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.contains('p', 'Select your Ansible Automation Platform subscription to use.').should(
      'be.visible'
    );
    // Initially, Subscription manifest is selected
    cy.get('.pf-v5-c-toggle-group__button')
      .eq(0)
      .should('have.attr', 'aria-pressed', 'true')
      .and('have.text', 'Subscription manifest');
    cy.contains(
      'p',
      'Upload a Red Hat Subscription Manifest containing your subscription. To generate your subscription manifest, go to subscription allocations on the Red Hat Customer Portal.'
    ).should('be.visible');
    cy.get('[data-cy="subscriptionfile-form-group"]').within(() => {
      cy.contains('Red Hat subscription manifest').should('be.visible');
    });
    cy.get('[data-cy="subscriptionfile"]').within(() => {
      cy.contains('button', 'Browse');
      cy.contains('button', 'Clear');
    });
    cy.get('.pf-v5-c-toggle-group__button')
      .eq(1)
      .should('have.attr', 'aria-pressed', 'false')
      .contains('Username / password');

    // Click on Username / password
    cy.get('.pf-v5-c-toggle-group__button').eq(1).contains('Username / password').click();
    cy.contains(
      'p',
      'Provide your Red Hat or Red Hat Satellite credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions.'
    ).should('be.visible');

    //When Username / password is selected
    cy.get('.pf-v5-c-toggle-group__button').eq(0).should('not.have.class', 'pf-m-selected');
    cy.get('[data-cy="username-form-group"]').within(() => {
      cy.contains('Red Hat Username').should('be.visible');
    });
    cy.get('[data-cy="password-form-group"]').within(() => {
      cy.contains('Red Hat Password').should('be.visible');
    });
    cy.get('.pf-v5-c-toggle-group__button').eq(1).should('have.class', 'pf-m-selected');
    cy.get('[data-cy="wizard-footer"]').within(() => {
      cy.contains('Next').and('has.attr', 'aria-disabled', 'false');
      cy.contains('Back').and('has.class', 'pf-m-disabled');
      cy.contains('Cancel').and('has.class', 'pf-m-link');
    });
  });

  it('verify that step 1 is current and error messages when proceeding without manifest', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.get('[data-cy="wizard-nav-item-subscription"] .pf-v5-c-wizard__nav-link').should(
      'have.class',
      'pf-m-current'
    );
    cy.get('[data-cy="wizard-footer"]').within(() => {
      cy.contains('Next').click();
      cy.contains('Back').and('has.class', 'pf-m-disabled');
      cy.contains('Cancel').and('has.class', 'pf-m-link');
    });
    cy.contains('Red Hat subscription manifest is required').should('be.visible');
  });

  it('verify the error messages when proceeding without credentials', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.get('.pf-v5-c-toggle-group__button').eq(1).contains('Username / password').click();
    cy.contains('Next').click();
    cy.get('[data-cy="username-form-group"]').within(() => {
      cy.contains('Red Hat username is required').should('be.visible');
    });
    cy.get('[data-cy="password-form-group"]').within(() => {
      cy.contains('Red Hat password is required').should('be.visible');
    });
    cy.get('[data-cy="pool-id-form-group"]').within(() => {
      cy.contains('Subscription is required').should('be.visible');
    });
  });
  it('verify the wizard navigation has 3 steps', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.get('[data-cy="wizard-nav"]').within(() => {
      cy.get('[data-cy="wizard-nav-item-subscription"]').should(
        'contain',
        'Ansible Automation Platform Subscription'
      );
      cy.get('[data-cy="wizard-nav-item-analytics"]').should('contain', 'Analytics');
      cy.get('[data-cy="wizard-nav-item-license-agreement"]').should(
        'contain',
        'End User License Agreement'
      );
    });
  });
  it('that step 2 is current and should allow to upload a manifest zip file', () => {
    cy.mount(<SubscriptionWizard onSuccess={() => {}} />);
    cy.fixture('manifest.zip', 'binary').then((fileBinary) => {
      const blob = Cypress.Blob.binaryStringToBlob(fileBinary as string);

      // create file from blob
      const file = new File([blob], 'manifest.zip', { type: 'application/zip' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      cy.get('input#subscriptionfile-filename').trigger('drop', {
        dataTransfer: dataTransfer,
      });
    });
    cy.get('[data-cy="wizard-footer"]').within(() => {
      cy.clickButton('Next');
    });
    cy.get('[data-cy="wizard-nav-item-analytics"] .pf-v5-c-wizard__nav-link').should(
      'have.class',
      'pf-m-current'
    );
    cy.contains('h1', 'Analytics').should('be.visible');
    cy.get('[data-cy="analyticsEnabled"]').should('have.attr', 'checked');
    cy.contains('a', 'Ansible Automation Platform documentation page').should(
      'have.attr',
      'target',
      '_blank'
    );
    const automationAnalytics_URL =
      'https://docs.ansible.com/automation-controller/latest/html/administration/usability_data_collection.html#automation-analytics';
    cy.get('a[target="_blank"]').invoke('attr', 'href').as('externalLink');
    cy.get('@externalLink').then((url) => {
      expect(url).to.include(automationAnalytics_URL);
    });
    cy.checkAnchorLinks('a');
    cy.contains('h3', 'Automation Analytics').should('be.visible');
    cy.contains(
      'p',
      'Gain insights into your deployments through visual dashboards and organization statistics, calculate your return on investment, and explore automation process details.'
    ).should('be.visible');
    cy.clickButton('Next');
    cy.get('.pf-v5-c-check').within(() => {
      cy.get('[data-cy="agree"]').check();
      cy.get('.pf-v5-c-check__label').should(
        'have.text',
        'I agree to the terms of the license agreement*'
      );
    });
    cy.clickButton('Next');
    cy.get('ol[role="list"]').within(() => {
      cy.contains('Subscription').parents('li').should('have.class', 'pf-m-success');
      cy.contains('Analytics').parents('li').should('have.class', 'pf-m-success');
      cy.contains('Agreement').parents('li').should('have.class', 'pf-m-success');
    });
    //cy.clickButton('Finish');
  });
});
