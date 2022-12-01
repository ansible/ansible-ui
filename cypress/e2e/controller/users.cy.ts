/// <reference types="cypress" />
describe('users', () => {
  it('users page', () => {
    cy.navigateTo(/^Users$/)
    cy.hasTitle(/^Users$/)
  })

  it('user details', () => {
    cy.navigateTo(/^Users$/)
    cy.clickRow(/^user001$/)
    cy.hasTitle(/^user001$/)
  })

  it('users toolbar delete users', () => {
    cy.navigateTo(/^Users$/)
    cy.get('#select-all').click()
    cy.clickToolbarAction(/^Delete selected users/)
    cy.get('#confirm').click()
    cy.clickButton(/^Delete user/)
    cy.contains(/^Success$/)
    cy.clickButton(/^Close$/)
  })

  it('users empty state', () => {
    cy.navigateTo(/^Users$/)
    cy.contains('No users yet')
  })

  it('empty state create user', () => {
    cy.navigateTo(/^Users$/)
    cy.clickButton(/^Create user$/)
    cy.hasTitle(/^Create user$/)
  })
})
