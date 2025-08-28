import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
  
  env: {
    // Environment variables for testing
    apiUrl: 'http://localhost:54321', // Supabase local development
    testUser: {
      email: 'test@example.com',
      password: 'testpassword123',
    },
  },
  
  retries: {
    runMode: 2,
    openMode: 0,
  },
  
  // Disable video recording for faster test runs
  video: false,
  
  // Screenshot configuration
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  
  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
    },
  },
});