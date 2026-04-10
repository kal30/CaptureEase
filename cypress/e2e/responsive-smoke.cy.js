const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
]

const assertNoHorizontalOverflow = () => {
  cy.window().then((win) => {
    const doc = win.document.documentElement
    expect(doc.scrollWidth, 'document scroll width').to.be.lte(doc.clientWidth + 1)
  })
}

describe('Responsive browser smoke tests', () => {
  viewports.forEach((viewport) => {
    it(`renders the landing page on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/')

      cy.get('[data-cy="landing-page"]').should('be.visible')
      cy.get('[data-cy="landing-hero"]').should('be.visible')
      cy.get('[data-cy="landing-start-tracking-btn"]').should('be.visible')
      cy.get('[data-cy="landing-how-it-works"]').should('be.visible')
      cy.get('[data-cy="landing-footer"]').should('be.visible')

      assertNoHorizontalOverflow()
    })

    it(`renders the about page on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/about')

      cy.get('[data-cy="about-page"]').should('be.visible')
      cy.get('[data-cy="about-title"]').should('contain.text', 'About Us')
      cy.get('[data-cy="about-get-started-btn"]').should('be.visible')
      cy.get('[data-cy="about-image-column"]').should('be.visible')

      assertNoHorizontalOverflow()
    })
  })
})
