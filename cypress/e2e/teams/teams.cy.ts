/// <reference types="cypress" />
describe('teams', () => {
  it('create team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickButton(/^Create team$/)
    cy.getByLabel(/^Name$/).type('My team', { delay: 0 })
    cy.getByLabel(/^Organization/).type('Default', { delay: 0 })
    cy.clickButton(/^Create team$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^My team$/)
    cy.contains('#name', /^My team$/)
  })

  it('edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 002$/)
    cy.clickButton(/^Edit team$/)
    cy.url().should('include', '/teams/edit')
    cy.contains('.pf-c-title', /^Edit team$/)
    cy.getByLabel(/^Name$/).type('a', { delay: 0 })
    cy.clickButton(/^Save team$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 002a$/)
  })

  it('team details', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 001$/)
    cy.clickButton(/^Details$/)
    cy.contains('#name', /^Team 001$/)
    cy.contains('#organization', /^Default$/)
  })

  it('team access', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 001$/)
    cy.contains('button[role="tab"]', 'Access').click()
  })

  it('team roles', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 001$/)
    cy.contains('button[role="tab"]', 'Roles').click()
  })

  it('team details edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 003$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 003$/)
    cy.clickButton(/^Edit team$/)
    cy.url().should('include', '/teams/edit')
    cy.contains('.pf-c-title', /^Edit team$/)
    cy.getByLabel(/^Name$/).type('a', { delay: 0 })
    cy.clickButton(/^Save team$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 003a$/)
  })

  it('team details delete team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 004$/)
    cy.url().should('include', '/teams/details')
    cy.contains('.pf-c-title', /^Team 004$/)
    cy.clickPageAction(/^Delete team/)
    cy.contains('.pf-c-modal-box__title-text', /^Permanently delete team/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete team/)
    cy.url().should('include', '/teams?')
  })

  it('teams table row edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRowAction(/^Team 001$/, /^Edit team$/)
    cy.url().should('include', '/teams/edit')
  })

  it('teams table row delete team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRowAction(/^Team 005$/, /^Delete team/)
    cy.contains('.pf-c-modal-box__title-text', /^Permanently delete team/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete team/)
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
    cy.contains('.pf-c-modal-box__title-text', /^Permanently delete team/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete team/)
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
    cy.contains('.pf-c-title', /^Create team$/)
  })
})
