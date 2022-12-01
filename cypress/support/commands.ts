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
      clickLink(label: string | RegExp): Chainable<void>
      clickButton(label: string | RegExp): Chainable<void>
      navigateTo(label: string | RegExp): Chainable<void>
      hasTitle(label: string | RegExp): Chainable<void>
      clickToolbarAction(label: string | RegExp): Chainable<void>
      clickRow(name: string | RegExp): Chainable<void>
      clickRowAction(name: string | RegExp, label: string | RegExp): Chainable<void>
      clickPageAction(label: string | RegExp): Chainable<void>
    }
  }
}

Cypress.Commands.add('getByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label)
    .parent()
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id)
      }
    })
})

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a', label).click()
})

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('button:not(:disabled)', label).click()
})

Cypress.Commands.add('navigateTo', (label: string | RegExp) => {
  cy.get('#page-sidebar').then((c) => {
    if (c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click()
    }
  })
  cy.contains('.pf-c-nav__link', label).click()
  cy.get('#page-sidebar').then((c) => {
    if (!c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click()
    }
  })
  // cy.contains('.pf-c-title', label)
})

Cypress.Commands.add('hasTitle', (label: string | RegExp) => {
  cy.contains('.pf-c-title', label)
})

Cypress.Commands.add('clickToolbarAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click()
})

Cypress.Commands.add('clickRow', (name: string | RegExp) => {
  cy.contains('td', name).within(() => {
    cy.get('a').click()
  })
})

Cypress.Commands.add('clickRowAction', (name: string | RegExp, label: string | RegExp) => {
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('.pf-c-dropdown__toggle').click()
      cy.get('.pf-c-dropdown__menu-item').contains(label).click()
    })
})

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click()
})

// Cypress.Commands.overwrite('type', (originalFn, subject, text, options: Partial<Cypress.TypeOptions> = {}) => {
//     options.delay = options.delay || 100
//     return (originalFn as (subject: string, text: unknown, options: Partial<Cypress.TypeOptions>) => Cypress.Chainable<unknown>)(
//         subject,
//         text,
//         options
//     )
// })

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
    const url = req.url.slice(req.url.indexOf(baseUrl.split('*')[0]) + baseUrl.length + 1)
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
        req.reply(500, {
          a: req.url,
          b: baseUrl,
          u: url,
        })
        break
    }
  })
  cy.intercept('POST', `${baseUrl}/`, (req) => {
    // const parts = req.url.split('/')
    let id = 1
    while (items.find((item) => item.id === id)) {
      id++
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
    const url = req.url.slice(req.url.indexOf(baseUrl) + baseUrl.length + 1)
    const parts = url.split('/')
    switch (parts.length) {
      case 2:
        {
          const id = Number(parts[0])
          if (Number.isInteger(id)) {
            const itemIndex = items.findIndex((item) => item.id === id)
            if (itemIndex !== -1) {
              const item = items[itemIndex]
              req.reply(200, item)
              items.splice(itemIndex, 1)
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
}

const organizations: IControllerItem[] = []
const teams: IControllerItem[] = []
const users: IControllerItem[] = []

before(() => {
  window.localStorage.setItem('access', 'true')
  window.localStorage.setItem('theme', 'light')

  if (Cypress.env('mock')) {
    cy.fixture('organizations.json').then((json: ItemsResponse<IControllerItem>) => {
      for (const item of json.results) {
        organizations.push(item)
      }
    })
    cy.fixture('teams.json').then((json: ItemsResponse<IControllerItem>) => {
      for (const item of json.results) {
        teams.push(item)
      }
    })
    cy.fixture('users.json').then((json: ItemsResponse<IControllerItem>) => {
      for (const item of json.results) {
        users.push(item)
      }
    })

    cy.intercept('GET', '/api/login/', { statusCode: 200 })
    cy.intercept('POST', '/api/login/', { statusCode: 200 })
    cy.fixture('me.json').then((json: string) => cy.intercept('GET', '/api/v2/me/', json))
  }

  cy.visit(`/controller/debug`)
  // cy.injectAxe()
})

beforeEach(() => {
  window.localStorage.setItem('access', 'true')
  window.localStorage.setItem('theme', 'light')

  if (Cypress.env('mock')) {
    cy.intercept('GET', '/api/login/', { statusCode: 200 })
    cy.intercept('POST', '/api/login/', { statusCode: 200 })
    cy.fixture('me.json').then((json: string) => cy.intercept('GET', '/api/v2/me/', json))

    handleControllerCollection('/api/v2/organizations/*/users', users)
    handleControllerCollection('/api/v2/organizations/*/teams', teams)
    handleControllerCollection('/api/v2/organizations', organizations)
    handleControllerCollection('/api/v2/teams/*/access_list', users)
    handleControllerCollection('/api/v2/teams', teams)
    handleControllerCollection('/api/v2/users', users)
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

afterEach(() => {
  // cy.checkA11y()
})
