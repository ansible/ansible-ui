/// <reference types="cypress" />
describe('organizations', () => {
    it('loads', () => {
        cy.visit(`/organizations`)
        cy.get('.pf-c-title').contains(/^Organizations$/)
    })
})
