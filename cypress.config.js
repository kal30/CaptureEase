const { defineConfig } = require('cypress')
const emulatorTasks = require('./cypress/tasks/firebaseEmulator')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      REACT_APP_USE_FIREBASE_EMULATORS: 'true',
      // Test user credentials
      TEST_EMAIL: 'test@captureez.com',
      TEST_PASSWORD: 'TestPassword123!',
      // Firebase emulator settings
      FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
      FIRESTORE_EMULATOR_HOST: 'localhost:8080'
    },
    setupNodeEvents(on, config) {
      on('task', {
        seedDatabase: emulatorTasks.seedDatabase,
        clearDatabase: emulatorTasks.clearDatabase,
      })
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/components/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
})
