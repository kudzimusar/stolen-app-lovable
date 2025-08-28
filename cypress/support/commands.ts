// Basic utility commands for Cypress

// Custom command to wait for element to be visible
Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Custom command to click element safely
Cypress.Commands.add('clickSafely', (selector: string) => {
  cy.get(selector).should('be.visible').should('not.be.disabled').click();
});

// Custom command to type safely
Cypress.Commands.add('typeSafely', (selector: string, text: string) => {
  cy.get(selector).should('be.visible').clear().type(text);
});

// Custom command to select option from dropdown
Cypress.Commands.add('selectOption', (selector: string, option: string) => {
  cy.get(selector).click();
  cy.get(`[data-value="${option}"]`).click();
});

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector: string) => {
  cy.get('body').should('contain', selector);
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

// Custom command to check for error messages
Cypress.Commands.add('checkForErrors', () => {
  cy.get('[data-testid="error-message"]').should('not.exist');
});

// Type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      waitForElement(selector: string, timeout?: number): Chainable<void>;
      clickSafely(selector: string): Chainable<void>;
      typeSafely(selector: string, text: string): Chainable<void>;
      selectOption(selector: string, option: string): Chainable<void>;
      elementExists(selector: string): Chainable<void>;
      waitForLoading(): Chainable<void>;
      checkForErrors(): Chainable<void>;
    }
  }
}