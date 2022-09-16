/// <reference types="cypress" />
describe('teams', () => {
    it('loads', () => {
        cy.visit(`/teams`)
        cy.get('.pf-c-title').contains(/^Teams$/)
    })

    it('create team', () => {
        cy.clickButton(/^ Create$/)
        cy.getByLabel(/^Name$/).type('Team 001')
        cy.getByLabel(/^Organization/).type('Default')
        cy.clickButton(/^Create$/)
    })

    it('created team details', () => {
        cy.get('.pf-c-title').contains(/^Team 001$/)
        cy.get('#name').contains(/^Team 001$/)
    })

    it('edit team', () => {
        cy.clickButton(/^ Edit$/)
        cy.getByLabel(/^Name$/).type('a')
        cy.clickButton(/^Save$/)
    })

    it('edited team details', () => {
        cy.get('.pf-c-title').contains(/^Team 001a$/)
        cy.get('#name').contains(/^Team 001a$/)
    })
})
