// Custom Cypress commands for CaptureEase testing

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(email)
    cy.get('[data-cy="password-input"]').type(password)
    cy.get('[data-cy="login-btn"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-btn"]').click()
  cy.url().should('include', '/')
})

// Create profile command
Cypress.Commands.add('createProfile', (profileData) => {
  cy.get('[data-cy="add-profile-btn"]').click()
  cy.get('[data-cy="profile-name-input"]').type(profileData.name)
  cy.get('[data-cy="profile-age-input"]').type(profileData.age)
  
  if (profileData.conditions) {
    profileData.conditions.forEach(condition => {
      cy.get('[data-cy="conditions-input"]').click().type(`${condition}{enter}`)
    })
  }
  
  if (profileData.allergies) {
    profileData.allergies.forEach(allergy => {
      cy.get('[data-cy="food-allergies-input"]').click().type(`${allergy}{enter}`)
    })
  }
  
  cy.get('[data-cy="submit-profile-btn"]').click()
  cy.get('[data-cy="add-profile-modal"]').should('not.exist')
})

// Invite team member command
Cypress.Commands.add('inviteTeamMember', (email, role) => {
  cy.get('[data-cy="invite-team-btn"]').first().click()
  cy.get('[data-cy="invite-email-input"]').type(email)
  cy.get('[data-cy="team-role-select"]').click()
  cy.get(`[data-cy="role-option-${role.toLowerCase()}"]`).click()
  cy.get('[data-cy="send-invitation-btn"]').click()
  cy.contains('Invitation sent').should('be.visible')
})

// Wait for Firebase operations
Cypress.Commands.add('waitForFirebase', () => {
  cy.window().its('firebase').should('exist')
  cy.wait(1000) // Allow Firebase operations to complete
})

// Check accessibility
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y()
})

// Seed test data
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedDatabase')
})

// Clean test data  
Cypress.Commands.add('cleanTestData', () => {
  cy.task('clearDatabase')
})

// Take screenshot with timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// Verify no console errors
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then(win => {
    expect(win.console.error).to.not.have.been.called
  })
})

// Test responsive breakpoints
Cypress.Commands.add('testResponsive', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' }
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('[data-cy="dashboard-container"]').should('be.visible')
    cy.screenshotWithTimestamp(`responsive-${viewport.name}`)
  })
})