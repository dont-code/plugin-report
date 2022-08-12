import {
  clickAutoComplete,
  getContentArea,
  getDropdownListItemWithName,
  getDropdownWithName,
  getInputWithName,
  getSendButton,
  getSubMenuWithText,
  selectPopupChoiceWithText,
} from '../support/app.po';

describe('plugin-tester', () => {
  beforeEach(() => cy.visit('/'));

  it('should display Report Field', () => {
    cy.intercept('GET', '/assets/dev/templates.json').as('LoadTemplate');
    getSubMenuWithText('Dev').click(); // Move to dev page

    cy.wait('@LoadTemplate');
    clickAutoComplete('template');
    selectPopupChoiceWithText('Test Report Field');
    getSendButton().click();
    getSubMenuWithText('Report Field').click();

    getDropdownWithName('Test').click();
    getDropdownListItemWithName('Rosa Report').click();

    getContentArea().contains('Value of Test: Rosa');
  });

  it('should display Reporter entity', () => {
    cy.intercept('GET', '/assets/dev/templates.json').as('LoadTemplate');
    getSubMenuWithText('Dev').click(); // Move to dev page

    cy.wait('@LoadTemplate');
    clickAutoComplete('template');
    selectPopupChoiceWithText('Test Reported Entity');
    getSendButton().click();
    getSubMenuWithText('Reported').click();

    getContentArea().contains('Hello from ReportedEntityComponent !');
  });

  it('should still display other entities', () => {
    cy.intercept('GET', '/assets/dev/templates.json').as('LoadTemplate');
    getSubMenuWithText('Dev').click(); // Move to dev page

    cy.wait('@LoadTemplate');
    clickAutoComplete('template');
    selectPopupChoiceWithText('Test Other Entity');
    getSendButton().click();
    getSubMenuWithText('Not Reported').click();

    getInputWithName('id').type('abc');
    getInputWithName('count').type('124');
    getInputWithName('check').click();

    getContentArea().contains('Value of id: abc');
    getContentArea().contains('Value of count: 124');
  });
});
