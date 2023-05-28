Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get("form").within(() => {
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.root().submit();
  });
  cy.url().should("include", "/dashboard");
});
