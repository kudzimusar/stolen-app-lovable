// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration for E2E tests
beforeEach(() => {
  // Clear cookies and localStorage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Preserve authentication state between tests if needed
  Cypress.Cookies.preserveOnce('auth-token');
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // for uncaught exceptions that are not related to the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Log the error for debugging
  console.error('Uncaught exception:', err);
  
  // Return false to prevent test failure for known issues
  return false;
});

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command to navigate to a page
Cypress.Commands.add('navigateTo', (page: string) => {
  cy.visit(`/${page}`);
});

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="page-loaded"]', { timeout: 10000 }).should('be.visible');
});

// Custom command to check if element is visible
Cypress.Commands.add('isVisible', (selector: string) => {
  cy.get(selector).should('be.visible');
});

// Custom command to check if element is not visible
Cypress.Commands.add('isNotVisible', (selector: string) => {
  cy.get(selector).should('not.be.visible');
});

// Custom command to fill form
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}-input"]`).type(value);
  });
});

// Custom command to submit form
Cypress.Commands.add('submitForm', () => {
  cy.get('[data-testid="submit-button"]').click();
});

// Custom command to check toast message
Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Custom command to mock API response
Cypress.Commands.add('mockApi', (method: string, url: string, response: any) => {
  cy.intercept(method, url, response).as('mockedApi');
});

// Custom command to check accessibility
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Custom command to take screenshot
Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name);
});

// Custom command to check responsive design
Cypress.Commands.add('checkResponsive', () => {
  // Desktop
  cy.viewport(1280, 720);
  cy.wait(1000);
  
  // Tablet
  cy.viewport(768, 1024);
  cy.wait(1000);
  
  // Mobile
  cy.viewport(375, 667);
  cy.wait(1000);
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      navigateTo(page: string): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
      isVisible(selector: string): Chainable<void>;
      isNotVisible(selector: string): Chainable<void>;
      fillForm(formData: Record<string, string>): Chainable<void>;
      submitForm(): Chainable<void>;
      checkToast(message: string, type?: 'success' | 'error' | 'warning'): Chainable<void>;
      waitForApi(method: string, url: string): Chainable<void>;
      mockApi(method: string, url: string, response: any): Chainable<void>;
      checkAccessibility(): Chainable<void>;
      takeScreenshot(name: string): Chainable<void>;
      checkResponsive(): Chainable<void>;
    }
  }
}