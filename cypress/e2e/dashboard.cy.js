describe('Dashboard browser tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'))
  })

  it('renders the desktop dashboard and opens the actions menu', () => {
    cy.viewport(1440, 900)
    cy.visit('/dashboard')

    cy.get('[data-cy="dashboard-child-switcher"]', { timeout: 20000 })
      .should('be.visible')
      .and('contain.text', 'Mia Johnson')
      .and('contain.text', 'Your role: Care Owner')

    cy.get('[data-cy="dashboard-quick-note"]').should('be.visible')
    cy.get('[data-cy="dashboard-actions-menu"]').click()

    cy.contains('Add child').should('be.visible')
    cy.contains('Add careteam').should('be.visible')
    cy.contains('Prep for therapy').should('be.visible')
    cy.contains('Import .xlsx or .docx').should('be.visible')
    cy.contains('Edit Child Profile').should('be.visible')
    cy.contains('Delete Child Profile').should('be.visible')
  })

  it('renders the mobile dashboard and exposes touch controls', () => {
    cy.viewport('iphone-x')
    cy.visit('/dashboard')

    cy.get('[data-cy="dashboard-child-switcher"]', { timeout: 20000 })
      .should('be.visible')
      .and('contain.text', 'Mia Johnson')

    cy.get('[data-cy="mobile-quick-note"]').should('be.visible')
    cy.get('[data-cy="mobile-child-chat"]').should('be.visible')
    cy.get('[data-cy="mobile-child-actions"]').click()

    cy.contains('Add child').should('be.visible')
    cy.contains('Add careteam').should('be.visible')
    cy.contains('Prep for therapy').should('be.visible')
    cy.contains('Edit Child Profile').should('be.visible')
    cy.contains('Delete Child Profile').should('be.visible')
  })
})
