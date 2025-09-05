describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Clear database and seed test data
    cy.task('clearDatabase')
    cy.task('seedDatabase')
    
    // Visit the app
    cy.visit('/')
    
    // Login as test user
    cy.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'))
  })

  it('should display profile cards correctly', () => {
    // Wait for dashboard to load
    cy.get('[data-cy="dashboard-container"]', { timeout: 10000 }).should('be.visible')
    
    // Check profile cards are displayed
    cy.get('[data-cy="profile-card"]').should('have.length.at.least', 1)
    
    // Verify profile terminology (no "child" text)
    cy.contains('child', { matchCase: false }).should('not.exist')
    cy.contains('profile').should('exist')
  })

  it('should create a new profile successfully', () => {
    // Click add profile button
    cy.get('[data-cy="add-profile-btn"]').click()
    
    // Verify modal opens
    cy.get('[data-cy="add-profile-modal"]').should('be.visible')
    cy.contains('Add New profile').should('be.visible')
    
    // Fill out profile form
    cy.get('[data-cy="profile-name-input"]').type('Test Profile E2E')
    cy.get('[data-cy="profile-age-input"]').type('6')
    
    // Add a condition
    cy.get('[data-cy="conditions-input"]').click().type('ADHD{enter}')
    
    // Add food allergy
    cy.get('[data-cy="food-allergies-input"]').click().type('Peanuts{enter}')
    
    // Submit form
    cy.get('[data-cy="submit-profile-btn"]').click()
    
    // Verify success
    cy.get('[data-cy="add-profile-modal"]', { timeout: 10000 }).should('not.exist')
    cy.contains('Test Profile E2E').should('be.visible')
  })

  it('should edit an existing profile', () => {
    // Click on first profile card menu
    cy.get('[data-cy="profile-card"]').first().find('[data-cy="profile-menu-btn"]').click()
    
    // Click edit option
    cy.get('[data-cy="edit-profile-option"]').click()
    
    // Verify edit modal opens
    cy.get('[data-cy="edit-profile-modal"]').should('be.visible')
    
    // Update name
    cy.get('[data-cy="profile-name-input"]').clear().type('Updated Profile Name')
    
    // Save changes
    cy.get('[data-cy="save-profile-btn"]').click()
    
    // Verify changes saved
    cy.get('[data-cy="edit-profile-modal"]', { timeout: 10000 }).should('not.exist')
    cy.contains('Updated Profile Name').should('be.visible')
  })

  it('should manage care team members', () => {
    // Click invite team member button
    cy.get('[data-cy="invite-team-btn"]').first().click()
    
    // Verify invite modal opens
    cy.get('[data-cy="invite-modal"]').should('be.visible')
    
    // Fill invite form
    cy.get('[data-cy="invite-email-input"]').type('caregiver@test.com')
    cy.get('[data-cy="team-role-select"]').click()
    cy.get('[data-cy="role-option-caregiver"]').click()
    
    // Send invitation
    cy.get('[data-cy="send-invitation-btn"]').click()
    
    // Verify success message
    cy.contains('Invitation sent').should('be.visible')
  })

  it('should display care team with correct "me" label', () => {
    // Check that current user is displayed as "me" in care team
    cy.get('[data-cy="care-team-display"]').first().should('be.visible')
    cy.get('[data-cy="member-chip"]').contains('me').should('exist')
    
    // Verify role emoji is displayed
    cy.get('[data-cy="member-chip"]').contains('me').find('span').should('contain', '👑')
  })

  it('should handle profile deletion', () => {
    // Get initial profile count
    cy.get('[data-cy="profile-card"]').then($cards => {
      const initialCount = $cards.length
      
      // Click profile menu
      cy.get('[data-cy="profile-card"]').first().find('[data-cy="profile-menu-btn"]').click()
      
      // Click delete option
      cy.get('[data-cy="delete-profile-option"]').click()
      
      // Confirm deletion
      cy.get('[data-cy="confirm-delete-btn"]').click()
      
      // Verify profile is removed
      cy.get('[data-cy="profile-card"]').should('have.length', initialCount - 1)
    })
  })

  it('should validate i18n translations', () => {
    // Check key UI elements use translations
    cy.contains('Care Team').should('exist')
    cy.contains('Medical & Behavioral Profile').should('exist')
    
    // Open add profile modal to check field labels
    cy.get('[data-cy="add-profile-btn"]').click()
    cy.get('[data-cy="profile-name-input"]').should('have.attr', 'placeholder')
    cy.get('[data-cy="profile-age-input"]').should('have.attr', 'placeholder')
  })

  it('should be responsive on mobile', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    
    // Verify layout adapts
    cy.get('[data-cy="dashboard-container"]').should('be.visible')
    cy.get('[data-cy="profile-card"]').should('be.visible')
    
    // Test mobile navigation
    cy.get('[data-cy="mobile-nav-toggle"]').click()
    cy.get('[data-cy="mobile-nav-menu"]').should('be.visible')
  })

  it('should handle offline scenarios', () => {
    // Simulate offline
    cy.window().then(win => {
      win.navigator.serviceWorker.ready.then(registration => {
        // Test offline functionality
        cy.get('[data-cy="offline-indicator"]').should('be.visible')
      })
    })
  })
})