describe("Login", () => {
  it("Loguea al usuario correctamente", () => {
    // Utilizar Cypress.env para obtener el usuario y contraseña desde la línea de comandos
    const username = Cypress.env("username");
    const password = Cypress.env("password");

    // Realizar la autenticación
    cy.login(username, password);

    // Verificación
    cy.url().should("include", "/dashboard");
  });
});
