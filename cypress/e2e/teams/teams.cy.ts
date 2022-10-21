/// <reference types="cypress" />
describe('teams', () => {
    it('create team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickButton(/^Create team$/)
        cy.getByLabel(/^Name$/).type('My team', { delay: 0 })
        cy.getByLabel(/^Organization/).type('Default', { delay: 0 })
        cy.clickButton(/^Create team$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^My team$/)
        cy.get('#name').contains(/^My team$/)
    })

    it('edit team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 002$/)
        cy.clickButton(/^Edit team$/)
        cy.url().should('include', '/teams/edit')
        cy.get('.pf-c-title').contains(/^Edit team$/)
        cy.getByLabel(/^Name$/).type('a', { delay: 0 })
        cy.clickButton(/^Save team$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 002a$/)
    })

    it('team details', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 001$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 001$/)

        cy.get('button')
            .contains(/^Details$/)
            .click()
        cy.get('#name').contains(/^Team 001$/)
        cy.get('#organization').contains(/^Default$/)
    })

    it('team access', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 001$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 001$/)
        cy.get('button').get('[role="tab"]').contains('Access').click()
    })

    it('team roles', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 001$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 001$/)
        cy.get('button').get('[role="tab"]').contains('Roles').click()
    })

    it('team details edit team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 003$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 003$/)
        cy.get('button:not(:disabled)')
            .contains(/^Edit team$/)
            .click()
        cy.url().should('include', '/teams/edit')
        cy.get('.pf-c-title').contains(/^Edit team$/)
        cy.getByLabel(/^Name$/).type('a', { delay: 0 })
        cy.clickButton(/^Save team$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 003a$/)
    })

    it('team details delete team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRow(/^Team 004$/)
        cy.url().should('include', '/teams/details')
        cy.get('.pf-c-title').contains(/^Team 004$/)
        cy.clickPageAction(/^Delete team$/)
        cy.get('.pf-c-modal-box__title-text').contains(/^Permanently delete team$/)
        cy.get('#confirm').click()
        cy.clickButton(/^Delete team$/)
        cy.contains(/^Success$/)
        cy.clickButton(/^Close$/)
    })

    it('teams table row edit team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRowAction(/^Team 001$/, /^Edit team$/)
        cy.url().should('include', '/teams/edit')
    })

    it('teams table row delete team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickRowAction(/^Team 005$/, /^Delete team$/)
        cy.get('.pf-c-modal-box__title-text').contains(/^Permanently delete team$/)
        cy.get('#confirm').click()
        cy.clickButton(/^Delete team$/)
        cy.contains(/^Success$/)
        cy.clickButton(/^Close$/)
    })

    it('teams toolbar delete teams', () => {
        cy.navigateTo(/^Teams$/)
        cy.get('#select-all').click()
        cy.get('#toggle-kebab')
            .click()
            .get('.pf-c-dropdown__menu-item')
            .contains('Delete selected teams')
            .click()
        cy.get('.pf-c-modal-box__title-text').contains(/^Permanently delete teams$/)
        cy.get('#confirm').click()
        cy.clickButton(/^Delete teams$/)
        cy.contains(/^Success$/)
        cy.clickButton(/^Close$/)
    })

    it('teams empty state', () => {
        cy.navigateTo(/^Teams$/)
        cy.contains('No teams yet')
    })

    it('empty state create team', () => {
        cy.navigateTo(/^Teams$/)
        cy.clickButton(/^Create team$/)
        cy.get('.pf-c-title').contains(/^Create team$/)
    })
})
