/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

import '@cypress/code-coverage/support'

declare global {
    namespace Cypress {
        interface Chainable {
            // login(): Chainable<void>
        }
    }
}

before(() => {
    window.localStorage.setItem('access', 'true')

    // Cypress.Cookies.defaults({
    //     preserve: ['_csrf', '_oauth_proxy', 'acm-access-token-cookie'],
    // })
    // cy.login()
    // cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
    // cy.get('.pf-c-page__main').contains('Red Hat', { timeout: 5 * 60 * 1000 })
})
