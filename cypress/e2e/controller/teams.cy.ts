/// <reference types="cypress" />
describe('teams', () => {
  it('create team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickButton(/^Create team$/)
    cy.typeByLabel(/^Name$/, 'My team')
    cy.typeByLabel(/^Organization/, 'Default')
    cy.clickButton(/^Create team$/)
    cy.hasTitle(/^My team$/)
  })

  it('edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 002$/)
    cy.clickButton(/^Edit team$/)
    cy.hasTitle(/^Edit team$/)
    cy.typeByLabel(/^Name$/, 'a')
    cy.clickButton(/^Save team$/)
    cy.hasTitle(/^Team 002a$/)
  })

  it('team details', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.hasTitle(/^Team 001$/)
    cy.clickButton(/^Details$/)
    cy.contains('#name', /^Team 001$/)
    cy.contains('#organization', /^Default$/)
  })

  it('team access', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.hasTitle(/^Team 001$/)
    cy.clickTab(/^Access$/).click()
  })

  it('team roles', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 001$/)
    cy.hasTitle(/^Team 001$/)
    cy.clickTab(/^Roles$/).click()
  })

  it('team details edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 003$/)
    cy.hasTitle(/^Team 003$/)
    cy.clickButton(/^Edit team$/)
    cy.hasTitle(/^Edit team$/)
    cy.typeByLabel(/^Name$/, 'a')
    cy.clickButton(/^Save team$/)
    cy.hasTitle(/^Team 003a$/)
  })

  it('team details delete team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRow(/^Team 004$/)
    cy.hasTitle(/^Team 004$/)
    cy.clickPageAction(/^Delete team/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete team/)
    cy.hasTitle(/^Teams$/)
  })

  it('teams table row edit team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRowAction(/^Team 001$/, /^Edit team$/)
    cy.hasTitle(/^Edit team$/)
  })

  it('teams table row delete team', () => {
    cy.navigateTo(/^Teams$/)
    cy.clickRowAction(/^Team 005$/, /^Delete team/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete team/)
    cy.contains(/^Success$/)
    cy.clickButton(/^Close$/)
  })

  it('teams toolbar delete teams', () => {
    cy.navigateTo(/^Teams$/)
    cy.get('#select-all').click()
    cy.clickToolbarAction(/^Delete selected teams/)
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
    cy.hasTitle(/^Create team$/)
  })
})
