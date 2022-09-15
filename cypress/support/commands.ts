/* eslint-disable @typescript-eslint/no-namespace */
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
import { Team } from '../../frontend/controller/access/teams/Team'
import { ItemsResponse } from '../../frontend/Data'

declare global {
    namespace Cypress {
        // interface Chainable {
        //     // login(): Chainable<void>
        // }
    }
}

function handleControllerCollection(fixture: string) {
    cy.fixture(fixture).then((json: string) => {
        const i: ItemsResponse<Team> = (typeof json === 'string' ? JSON.parse(json) : json) as ItemsResponse<Team>
        const teams: Team[] = i.results
        cy.intercept('GET', '/api/v2/teams/?*', (req) => req.reply(200, teams))
        cy.intercept('DELETE', '/api/v2/teams/*/', (req) => {
            // const parts = req.url.split('/')
            const teamIndex = teams.findIndex((team) => team.id === 1)
            if (teamIndex === -1) {
                req.reply(404)
                return
            }
            teams.splice(teamIndex, 1)
            req.reply(200)
        })
    })
}

before(() => {
    window.localStorage.setItem('access', 'true')

    if (Cypress.env('mock')) {
        cy.intercept('GET', '/api/login/', { statusCode: 200 })
        cy.intercept('POST', '/api/login/', { statusCode: 200 })
        cy.fixture('me.json').then((json: string) => cy.intercept('GET', '/api/v2/me/', json))
        handleControllerCollection('teams.json')
    }

    cy.visit(`/login`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
    cy.get('#server').type('https://localhost:8043')
    cy.get('#username').type('test')
    cy.get('#password').type('test')
    cy.get('button[type=submit]').click()

    // Cypress.Cookies.preserveOnce(names...)

    // Cypress.Cookies.defaults({
    //     preserve: ['_csrf', '_oauth_proxy', 'acm-access-token-cookie'],
    // })
    // cy.login()
    // cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
    // cy.get('.pf-c-page__main').contains('Red Hat', { timeout: 5 * 60 * 1000 })
})
