/// <reference types="cypress" />
describe('teams', () => {
    it('loads', () => {
        cy.visit(`/teams`)
        cy.get('.pf-c-title').contains(/^Teams$/)
    })

    it('create team', () => {
        cy.clickButton(/^ Create$/)
        cy.getByLabel(/^Name$/).type('Team 002')
        cy.getByLabel(/^Organization/).type('Default')
        cy.clickButton(/^Create$/)
    })

    it('created team details', () => {
        cy.get('.pf-c-title').contains(/^Team 002$/)
        cy.get('#name').contains(/^Team 002$/)
    })

    it('edit team', () => {
        cy.clickButton(/^ Edit$/)
        cy.getByLabel(/^Name$/).type('a')
        cy.clickButton(/^Save$/)
    })

    it('edited team details', () => {
        cy.get('.pf-c-title').contains(/^Team 002a$/)
        cy.get('#name').contains(/^Team 002a$/)
    })

    it('delete teams', () => {
        cy.get('.pf-c-breadcrumb__item')
            .contains(/^Teams$/)
            .click()
        cy.get('#select-all').click()
        cy.get('#toggle-kebab').click()
        cy.get('.pf-c-dropdown__menu-item').contains('Delete selected teams').click()
        cy.get('#confirm').click()
        cy.clickButton('Delete')
        cy.contains('Success')
        cy.clickButton('Close')
    })

    it('teams empty state', () => {
        cy.contains('No teams yet')
    })
})
