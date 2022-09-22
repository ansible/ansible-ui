/// <reference types="cypress" />
describe('teams', () => {
    it('loads', () => {
        cy.navigateTo(/^Teams$/)
    })

    it('create team', () => {
        cy.clickButton(/^Create team$/)
        cy.getByLabel(/^Name$/).type('My team', { delay: 0 })
        cy.getByLabel(/^Organization/).type('Default', { delay: 0 })
        cy.clickButton(/^Create team$/)
    })

    it('created team details', () => {
        cy.get('.pf-c-title').contains(/^My team$/)
        cy.get('#name').contains(/^My team$/)
    })

    it('edit team', () => {
        cy.clickButton(/^Edit team$/)
        cy.getByLabel(/^Name$/).type(' 003', { delay: 0 })
        cy.clickButton(/^Save team$/)
    })

    it('edited team details', () => {
        cy.get('.pf-c-title').contains(/^My team 003$/)
        cy.get('#name').contains(/^My team 003$/)
    })

    it('delete team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRowAction(/^My team 003$/, /^Delete team$/)
        cy.get('#confirm').click()
        cy.clickButton('Delete')
        cy.contains('Success')
        cy.clickButton('Close')
    })

    it('delete teams', () => {
        cy.navigateTo(/^Teams$/)
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
