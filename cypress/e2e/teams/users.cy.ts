/// <reference types="cypress" />
describe('users', () => {
    it('loads', () => {
        cy.navigateTo(/^Users$/)
    })

    it('create user', () => {
        cy.clickButton(/^Create user$/)
        cy.getByLabel(/^Username$/).type('User002')
        cy.getByLabel(/^Organization/).type('Default')
        cy.getByLabel(/^Password/).type('123')
        cy.getByLabel(/^Confirm password/).type('123')
        cy.clickButton(/^Create user$/)
    })

    it('created user details', () => {
        cy.get('.pf-c-title').contains(/^User002$/)
        cy.get('#username').contains(/^User002$/)
    })

    it('edit user', () => {
        cy.clickButton(/^Edit user$/)
        cy.getByLabel(/^Username$/).type('a')
        cy.clickButton(/^Save user$/)
    })

    it('edited user details', () => {
        cy.get('.pf-c-title').contains(/^User002a$/)
        cy.get('#username').contains(/^User002a$/)
    })

    it('delete users', () => {
        cy.get('.pf-c-breadcrumb__item')
            .contains(/^Users$/)
            .click()
        cy.get('#select-all').click()
        cy.get('#toggle-kebab').click()
        // cy.get('.pf-c-dropdown__menu-item').contains('Delete selected users').click()
        // cy.get('#confirm').click()
        // cy.clickButton('Delete')
        // cy.contains('Success')
        // cy.clickButton('Close')
    })

    // it('users empty state', () => {
    //     cy.contains('No users yet')
    // })
})
