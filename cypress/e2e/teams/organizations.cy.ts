/// <reference types="cypress" />
describe('organizations', () => {
    it('loads', () => {
        cy.navigateTo(/^Organizations$/)
    })

    it('create organization', () => {
        cy.clickButton(/^Create organization$/)
        cy.getByLabel(/^Name$/).type('Organization 002')
        cy.clickButton(/^Create organization$/)
    })
})
