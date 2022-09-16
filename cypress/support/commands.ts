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
import { ItemsResponse } from '../../frontend/Data'

declare global {
    namespace Cypress {
        interface Chainable {
            getByLabel(label: string | RegExp): Chainable<void>
            clickButton(label: string | RegExp): Chainable<void>
        }
    }
}

Cypress.Commands.add('getByLabel', (label: string | RegExp) => {
    cy.get('.pf-c-form__label-text')
        .contains(label)
        .parent()
        .invoke('attr', 'for')
        .then((id: string | undefined) => {
            if (id) {
                cy.get('#' + id)
            }
        })
})

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
    cy.get('button').contains(label).click()
})

interface IControllerItem {
    id: number
    organization?: number
    created?: string
    modified?: string
    summary_fields?: {
        organization?: {
            id: number
            name: string
        }
    }
}

function handleControllerCollection<T extends IControllerItem>(baseUrl: string, items: T[]) {
    cy.intercept('GET', `${baseUrl}/*`, (req) => {
        const url = req.url.slice(req.url.indexOf(baseUrl) + baseUrl.length + 1)
        const parts = url.split('/')
        switch (parts.length) {
            case 1:
                {
                    const itemsResponse: ItemsResponse<T> = { count: items.length, results: items }
                    req.reply(200, itemsResponse)
                }
                break
            case 2:
                {
                    const id = Number(parts[0])
                    if (Number.isInteger(id)) {
                        const item = items.find((item) => item.id === id)
                        if (item) {
                            req.reply(200, item)
                        } else {
                            req.reply(404)
                        }
                    } else {
                        req.reply(500)
                    }
                }
                break
            default:
                req.reply(500)
                break
        }
    })
    cy.intercept('POST', `${baseUrl}/`, (req) => {
        // const parts = req.url.split('/')
        const id = 1
        while (items.find((item) => item.id === id)) {
            /**/
        }
        const item = req.body as T
        item.id = id
        if (item.organization !== undefined) {
            item.summary_fields = { organization: { id: 1, name: 'TODO' } }
        }
        item.created = new Date(Date.now()).toISOString()
        item.modified = new Date(Date.now()).toISOString()
        items.push(item)
        req.reply(201, item)
    })
    cy.intercept('PATCH', `${baseUrl}/*/`, (req) => {
        const url = req.url.slice(req.url.indexOf(baseUrl) + baseUrl.length + 1)
        const parts = url.split('/')
        switch (parts.length) {
            case 2:
                {
                    const id = Number(parts[0])
                    if (Number.isInteger(id)) {
                        const item = items.find((item) => item.id === id)
                        if (item) {
                            Object.assign(item, req.body)
                            item.modified = new Date(Date.now()).toISOString()
                            req.reply(200, item)
                        } else {
                            req.reply(404)
                        }
                    } else {
                        req.reply(500)
                    }
                }
                break
            default:
                req.reply(500)
                break
        }
    })
    cy.intercept('DELETE', `${baseUrl}/*/`, (req) => {
        // const parts = req.url.split('/')
        const teamIndex = items.findIndex((item) => item.id === 1)
        if (teamIndex === -1) {
            req.reply(404)
            return
        }
        items.splice(teamIndex, 1)
        req.reply(200)
    })
}

const teams: IControllerItem[] = []
const organizations: IControllerItem[] = []

before(() => {
    cy.fixture('teams.json').then((json: ItemsResponse<IControllerItem>) => {
        for (const item of json.results) {
            teams.push(item)
        }
    })
    cy.fixture('organizations.json').then((json: ItemsResponse<IControllerItem>) => {
        for (const item of json.results) {
            organizations.push(item)
        }
    })
})

beforeEach(() => {
    window.localStorage.setItem('access', 'true')

    if (Cypress.env('mock')) {
        cy.intercept('GET', '/api/login/', { statusCode: 200 })
        cy.intercept('POST', '/api/login/', { statusCode: 200 })
        cy.fixture('me.json').then((json: string) => cy.intercept('GET', '/api/v2/me/', json))
        handleControllerCollection('/api/v2/teams', teams)
        handleControllerCollection('/api/v2/organizations', organizations)
    }

    // cy.visit(`/login`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
    // cy.get('#server').type('https://localhost:8043')
    // cy.get('#username').type('test')
    // cy.get('#password').type('test')
    // cy.get('button[type=submit]').click()

    // Cypress.Cookies.preserveOnce(names...)

    // Cypress.Cookies.defaults({
    //     preserve: ['_csrf', '_oauth_proxy', 'acm-access-token-cookie'],
    // })
    // cy.login()
    // cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
    // cy.get('.pf-c-page__main').contains('Red Hat', { timeout: 5 * 60 * 1000 })
})
